import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { UserFriends } from '../entity/userFriends.entity';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { User } from '../entity/user.entity';

@Module({
  controllers: [FriendController],
  providers: [FriendService, UserService],
  imports: [
    TypeOrmModule.forFeature([UserFriends, User]),
    CacheModule,
    AuthModule,
  ],
})
export class FriendModule {}
