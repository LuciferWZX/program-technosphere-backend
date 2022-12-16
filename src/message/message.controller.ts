import { Bind, Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { EController } from '../constants/controller';
import { MessageService } from './message.service';
import { ContentType } from '../entity/type';
import { getUserIdByToken } from '../utils/util';
import { AppGateway } from '../app.gateway';
import { DataType } from '../types/socketDataType';
import { CacheService } from '../cache/cache.service';
import { Message } from '../entity/message.entity';

@Controller(EController.message)
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly cacheService: CacheService,
    private readonly appGateway: AppGateway,
  ) {}

  @Post('send_message')
  @HttpCode(200)
  @Bind(Req())
  async sendMessage(
    request,
    @Body()
    params: {
      contentType?: ContentType;
      content: string;
      receiverId: string;
    },
  ) {
    const { content, contentType, receiverId } = params;
    const token = request.headers?.authorization;
    const senderId = getUserIdByToken(token);
    const result = await this.messageService.createMessage({
      senderId: senderId,
      receiverId: receiverId,
      contentType: contentType,
      content: content,
    });
    await this.handleRedis({ senderId, receiverId }, result);
    this.appGateway.wsEmit(`${receiverId}-singleMsg`, {
      type: DataType.singleMsg,
      data: result,
    });
    return result;
  }

  @Post('create_conversation')
  @HttpCode(200)
  @Bind(Req())
  async createConversation(request, @Body() params: { fid: string }) {
    const { fid } = params;
    const token = request.headers?.authorization;
    const uid = getUserIdByToken(token);
    let friendsIds: string[] | undefined = await this.cacheService.hGet(
      'single-conversation',
      `${uid}`,
    );
    if (!friendsIds) {
      friendsIds = [fid];
    } else {
      if (!friendsIds.includes(fid)) {
        friendsIds = [fid].concat(friendsIds);
      }
    }
    await this.cacheService.hSet('single-conversation', `${uid}`, friendsIds);
    return 'ok';
  }

  async handleRedis(
    params: { senderId: string; receiverId: string },
    message: Message,
  ) {
    const { senderId, receiverId } = params;
    ///-------------------------插入msg-redis的消息------------------------------
    let msgMap: Map<string, Message> | undefined = await this.cacheService.hGet(
      `${senderId}-msg`,
      `${receiverId}`,
    );
    if (!msgMap) {
      msgMap = new Map();
    }
    msgMap.set(message.id, message);
    await this.cacheService.hSet(`${senderId}-msg`, `${receiverId}`, msgMap);
    ///---------------------检查是否在redis的聊天记录里面-----------------------------
    //先更新对方的数据缓存
    // let friendsIds: string[] | undefined = await this.cacheService.hGet(
    //   'single-conversation',
    //   `${senderId}`,
    // );
    // if (!friendsIds) {
    //   friendsIds = [senderId];
    // } else {
    //   if (!friendsIds.includes(senderId)) {
    //     friendsIds = [senderId].concat(friendsIds);
    //   }
    // }
    // await this.cacheService.hSet(
    //   'single-conversation',
    //   `${senderId}`,
    //   friendsIds,
    // );
  }
}
