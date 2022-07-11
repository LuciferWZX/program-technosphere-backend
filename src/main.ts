import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); //设置请求的前缀
  await app.listen(3000);
}

/**
 *启动项目
 */
async function start() {
  await bootstrap();
}
start().then();
