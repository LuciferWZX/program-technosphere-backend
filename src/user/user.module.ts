import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CacheModule } from '../cache/cache.module';

@Module({
  controllers: [UserController],
  imports: [CacheModule],
})
export class UserModule {}
