import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache, WrapArgsType } from 'cache-manager';
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  wrap<T>(...args: WrapArgsType<T>[]) {
    return this.cacheManager.wrap(...args);
  }
}
