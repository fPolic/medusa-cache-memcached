import Memcached from "memcached"

import { ICacheService, Logger } from "@medusajs/medusa"

import { MemcachedCacheModuleOptions } from "../types"

const DEFAULT_CACHE_TIME = 30 // 30 seconds

type InjectedDependencies = { logger: Logger }

class MemcachedCacheService implements ICacheService {
  protected readonly TTL: number
  protected readonly memcached: Memcached

  constructor(
    { logger }: InjectedDependencies,
    options: MemcachedCacheModuleOptions
  ) {
    
    try {
      this.memcached = new Memcached(options.location, options.options)
    } catch (err) {
      logger?.error(
        `An error occurred while connecting to Memcached instance in module 'cache-memcached': ${err}`
        )
      }
      
    this.TTL = options.ttl || DEFAULT_CACHE_TIME
  }
  /**
   * Set a key/value pair to the cache.
   * It is also possible to manage the ttl through environment variable using CACHE_TTL. If the ttl is 0 it will
   * act like the value should not be cached at all.
   * @param key
   * @param data
   * @param ttl
   */
  async set(
    key: string,
    data: Record<string, unknown>,
    ttl: number = this.TTL
  ): Promise<void> {
    return new Promise((res, rej) =>
      this.memcached.set(key, JSON.stringify(data), ttl, (err) => {
        if (err) {
          rej(err)
        } else {
          res()
        }
      })
    )
  }

  /**
   * Retrieve a cached value belonging to the given key.
   * @param cacheKey
   */
  async get<T>(cacheKey: string): Promise<T | null> {
    return new Promise((res, rej) => {
      this.memcached.get(cacheKey, (err, data) => {
        if (err) {
          res(null)
        } else {
          if (data) {
            res(JSON.parse(data))
          } else {
            res(null)
          }
        }
      })
    })
  }

  /**
   * Invalidate cache for a specific key.
   * @param key
   */
  async invalidate(key: string): Promise<void> {
    return new Promise((res, rej) => {
      this.memcached.del(key, (err) => {
        if (err) {
          rej(err)
        } else {
          res()
        }
      })
    })
  }
}

export default MemcachedCacheService
