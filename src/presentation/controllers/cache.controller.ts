import { Controller, Get, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    const stats = this.cacheService.getCacheStats();
    const keys = await this.cacheService.keys('*');
    
    return {
      ...stats,
      totalKeys: keys.length,
      sampleKeys: keys.slice(0, 10), // Show first 10 keys as sample
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCache() {
    await this.cacheService.clear();
    return { message: 'Cache cleared successfully' };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    const stats = this.cacheService.getCacheStats();
    return {
      status: 'ok',
      cache: {
        type: stats.type,
        available: stats.redisAvailable || stats.memoryEntries >= 0,
        provider: stats.redisAvailable ? 'Redis' : 'In-Memory',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
