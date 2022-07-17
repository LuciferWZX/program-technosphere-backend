import {
  Dependencies,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CacheModule } from './cache/cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { AuthorityMiddleware } from './middleware/authority.middleware';
import { AuthModule } from './auth/auth.module';

@Dependencies(Connection)
@Module({
  imports: [
    // 此处配置configmodule
    ConfigModule.forRoot({
      isGlobal: true,
      //cache: true,
      envFilePath: `config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dataBase = configService.get('dataBase');
        return {
          type: dataBase.type,
          host: dataBase.host,
          port: dataBase.port,
          username: dataBase.username,
          password: dataBase.password,
          database: dataBase.database,
          entities: [__dirname + '/entity/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
    }),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: '127.0.0.1',
    //   port: 3306,
    //   username: 'root',
    //   password: '123456',
    //   database: 'program_tech',
    //   entities: ['dist/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    // }),
    UserModule,
    CacheModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorityMiddleware)
      .forRoutes({
        path: 'user/test',
        method: RequestMethod.ALL,
      })
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }

  constructor(private readonly connection: Connection) {}
}
