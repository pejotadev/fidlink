import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from './cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    
    const cacheTtl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    // Build cache key with parameters
    const request = context.switchToHttp().getRequest();
    const finalCacheKey = this.buildCacheKey(cacheKey, {
      ...request.params,
      ...request.query,
      ...request.body, // Spread body properties directly
    });

    // Try to get from cache
    try {
      const cachedValue = await this.cacheService.get(finalCacheKey);
      if (cachedValue !== null) {
        this.logger.debug(`Cache HIT: ${finalCacheKey}`);
        return of(cachedValue);
      }
    } catch (error) {
      this.logger.warn(`Cache get error: ${error.message}`);
    }

    this.logger.debug(`Cache MISS: ${finalCacheKey}`);

    // Execute original method and cache result
    return next.handle().pipe(
      tap(async (result) => {
        try {
          await this.cacheService.set(finalCacheKey, result, {
            ttl: cacheTtl || 300,
          });
          this.logger.debug(`Cache SET: ${finalCacheKey}`);
        } catch (error) {
          this.logger.warn(`Cache set error: ${error.message}`);
        }
      }),
    );
  }

  private buildCacheKey(pattern: string, params: Record<string, any>): string {
    let key = pattern;
    
    // Replace {param} placeholders with actual values
    for (const [paramName, paramValue] of Object.entries(params)) {
      if (paramValue !== undefined) {
        key = key.replace(
          new RegExp(`\\{${paramName}\\}`, 'g'),
          String(paramValue),
        );
      }
    }

    // Remove any remaining placeholders
    key = key.replace(/\{[^}]+\}/g, 'undefined');
    
    return key;
  }
}
