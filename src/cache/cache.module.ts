import { Module } from '@nestjs/common';

import { CacheService } from './cache.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get('redis');
        return {
          closeClient: redis.closeClient,
          config: {
            //url: 'redis://@127.0.0.1:6379',
            url: `redis://${redis.password}@${redis.host}:${redis.port}${redis.db}`,
          },
        };
      },
    }),
    // RedisModule.forRoot({
    //   closeClient: true,
    //   config: {
    //     /**
    //      * URI scheme to be used to specify connection options as a redis:// URL or rediss:// URL.
    //      *
    //      * - redis - https://www.iana.org/assignments/uri-schemes/prov/redis
    //      * - rediss - https://www.iana.org/assignments/uri-schemes/prov/rediss
    //      *
    //      * @example
    //      * ```ts
    //      * // Connect to 127.0.0.1:6380, db 4, using password "authpassword":
    //      * 'redis://:authpassword@127.0.0.1:6380/4'
    //      * ```
    //      */
    //     url: 'redis://@127.0.0.1:6379',
    //     // 远程调试需要设置bindip 为0.0.0.0 并且设置密码
    //     // 非远程不需要密码
    //   },
    // }),
  ],
  //!!!!!!!外部模块需要使用必须先导出，外部模块引入
  // 将 CacheService 引入改模块
  providers: [CacheService],
  // 再将 CacheService 暴露出去
  exports: [CacheService],
})
export class CacheModule {}
