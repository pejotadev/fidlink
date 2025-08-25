import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: RedisClientType | null = null;
  private memoryCache = new Map<string, { value: any; expiry: number }>();
  private isRedisAvailable = false;

  async onModuleInit() {
    await this.initializeRedis();
    // Clean memory cache every 5 minutes
    setInterval(() => this.cleanExpiredMemoryCache(), 5 * 60 * 1000);
  }

  private async initializeRedis() {
    try {
      // Try to connect to Redis
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries < 3) {
              return Math.min(retries * 50, 500);
            }
            return false;
          }
        }
      });

      this.redisClient.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}`);
        this.isRedisAvailable = false;
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis connected successfully');
        this.isRedisAvailable = true;
      });

      await this.redisClient.connect();
      
      // Test Redis connection
      await this.redisClient.ping();
      this.isRedisAvailable = true;
      this.logger.log('✅ Redis cache enabled');
      
    } catch (error) {
      this.logger.warn(`❌ Redis not available: ${error.message}`);
      this.logger.log('📝 Falling back to in-memory cache');
      this.isRedisAvailable = false;
      this.redisClient = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisAvailable && this.redisClient) {
      try {
        const value = await this.redisClient.get(key);
        return value && typeof value === 'string' ? JSON.parse(value) : null;
      } catch (error) {
        this.logger.warn(`Redis get error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to memory cache
    return this.getFromMemory<T>(key);
  }

  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || 300; // Default 5 minutes

    if (this.isRedisAvailable && this.redisClient) {
      try {
        await this.redisClient.setEx(key, ttl, JSON.stringify(value));
        return;
      } catch (error) {
        this.logger.warn(`Redis set error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to memory cache
    this.setInMemory(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    if (this.isRedisAvailable && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (error) {
        this.logger.warn(`Redis del error for key ${key}: ${error.message}`);
      }
    }

    // Also remove from memory cache
    this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    if (this.isRedisAvailable && this.redisClient) {
      try {
        await this.redisClient.flushAll();
      } catch (error) {
        this.logger.warn(`Redis clear error: ${error.message}`);
      }
    }

    this.memoryCache.clear();
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.isRedisAvailable && this.redisClient) {
      try {
        return await this.redisClient.keys(pattern);
      } catch (error) {
        this.logger.warn(`Redis keys error: ${error.message}`);
      }
    }

    // Memory cache fallback - simple pattern matching
    const allKeys = Array.from(this.memoryCache.keys());
    if (pattern === '*') return allKeys;
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(key => regex.test(key));
  }

  private getFromMemory<T>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.value;
  }

  private setInMemory(key: string, value: any, ttlSeconds: number): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.memoryCache.set(key, { value, expiry });
  }

  private cleanExpiredMemoryCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.memoryCache.entries()) {
      if (now > cached.expiry) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }
  }

  // Utility methods for cache statistics
  getCacheStats() {
    return {
      type: this.isRedisAvailable ? 'redis' : 'memory',
      redisAvailable: this.isRedisAvailable,
      memoryEntries: this.memoryCache.size,
    };
  }
}
