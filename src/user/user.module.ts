import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CacheModule } from '../cache/cache.module';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserFriendRequestRecord } from '../entity/userFriendRequestRecord.entity';
import { AppGateway } from '../app.gateway';

@Module({
  controllers: [UserController],
  providers: [UserService, AppGateway],
  imports: [
    TypeOrmModule.forFeature([User, UserFriendRequestRecord]),
    CacheModule,
    AuthModule,
  ],
})
export class UserModule {}
