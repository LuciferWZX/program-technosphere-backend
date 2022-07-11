import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [UserModule, CacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
