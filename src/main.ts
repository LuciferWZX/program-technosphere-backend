import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const http = configService.get('http');
  app.enableCors();
  app.setGlobalPrefix(http.app_global_prefix); //设置请求的前缀
  app.useGlobalPipes(new ValidationPipe());
  // 全局注册错误的过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  // 全局注册拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(http.app_port, () => {
    Logger.log(
      `[${process.env.NODE_ENV}]已启动：http://localhost:${http.app_port}/${http.app_global_prefix}`,
    );
  });
}

/**
 *启动项目
 */
async function start() {
  await bootstrap();
}
start().then();
