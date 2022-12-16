import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { CacheModule } from '../cache/cache.module';
import { Message } from '../entity/message.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { AppGateway } from '../app.gateway';

@Module({
  controllers: [MessageController],
  providers: [MessageService, AppGateway],
  imports: [TypeOrmModule.forFeature([User, Message]), CacheModule],
})
export class MessageModule {}
