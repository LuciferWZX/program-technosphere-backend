import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { Message } from '../entity/message.entity';
import { ContentType } from '../entity/type';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  /**
   * 新增一条消息
   * @param params
   */
  async createMessage(params: {
    senderId: string;
    contentType?: ContentType;
    content: string;
    receiverId: string;
  }) {
    const { senderId, contentType, content, receiverId } = params;
    return this.messageRepository.save({
      senderId: senderId,
      content: content,
      contentType: contentType ?? ContentType.text,
      receiverId: receiverId,
    });
  }
}
