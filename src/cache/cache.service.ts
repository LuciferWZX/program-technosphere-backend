import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class CacheService {
  public redisClient;

  constructor(private redisService: RedisService) {
    this.getRedisClient().then(() => {
      console.info('redis连接成功');
    });
  }

  /**
   * 获取redis的client
   */
  async getRedisClient() {
    this.redisClient = await this.redisService.getClient();
  }
  /**
   * @Description: 封装设置redis缓存的方法
   * @param key {String} key值
   * @param value {String} key的值
   * @param seconds {Number} 过期时间 秒秒秒！！！
   * @return: Promise<any>
   */
  //设置值的方法
  public async set(key: string, value: unknown, seconds?: number) {
    value = JSON.stringify(value);
    if (!this.redisClient) {
      await this.getRedisClient();
    }
    if (!seconds) {
      await this.redisClient.set(key, value);
    } else {
      await this.redisClient.set(key, value, 'EX', seconds);
    }
  }
  //获取值的方法
  public async get<T>(key: string): Promise<T | undefined> {
    if (!this.redisClient) {
      await this.getRedisClient();
    }
    const data = await this.redisClient.get(key);
    if (!data) {
      return undefined;
    }
    return JSON.parse(data);
  }

  //获取值的方法
  public async del(key: string) {
    if (!this.redisClient) {
      await this.getRedisClient();
    }
    await this.redisClient.del(key);
  }
  // 清理缓存
  public async flushall(): Promise<any> {
    if (!this.redisClient) {
      await this.getRedisClient();
    }

    await this.redisClient.flushall();
  }
}
