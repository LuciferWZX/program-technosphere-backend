import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CacheService } from './cache/cache.service';
import { HashMapKey } from './types/cache-type';
import { User } from './entity/user.entity';
@Injectable()
@WebSocketGateway({
  path: '/socket',
  allowEIO3: true,
  cors: {
    origin: /.*/,
    credentials: true,
  },
  transport: ['websocket'],
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('WebSocketGateway');
  @WebSocketServer() private ws: Server; // socket实例
  private connectCounts = 0; // 当前在线人数
  private allNum = 0; // 全部在线人数
  private users: Map<string, any> = new Map(); // 人数信息
  constructor(private readonly cacheService: CacheService) {}
  /**
   *初始化
   */
  afterInit() {
    this.logger.log('websocket init ...');
  }

  /**
   * 连接成功
   * @param client
   */
  async handleConnection(client: Socket) {
    this.logger.log('连接成功 ...');
    const auth: { [p: string]: any } = client.handshake.auth;
    this.logger.log('登录的用户：', auth.token);
    this.connectCounts += 1;
    this.allNum += 1;
    const user: User = await this.cacheService.hGet(
      HashMapKey.OnlineUsersToken,
      `online:${auth.token}`,
    );
    this.users.set(`${auth.token}**${client.id}`, user);

    this.ws.emit('enter', this.users.get(`${auth.token}**${client.id}`));
    client.emit('enterName', this.users[client.id]);
  }

  /**
   * 断开连接
   * @param client
   */
  handleDisconnect(client: Socket) {
    this.logger.log('断开连接 ...');
    const auth: { [p: string]: any } = client.handshake.auth;
    console.log('已经离开:', `${auth.token}**${client.id}`);
    this.allNum -= 1;
    this.users.delete(`${auth.token}-${client.id}`);
    this.ws.emit('leave', {
      name: this.users[client.id],
      allNum: this.allNum,
      connectCounts: this.connectCounts,
    });
  }

  @SubscribeMessage('message')
  /**
   * 监听发送消息
   */
  handleMessage(client: Socket, data: any) {
    console.log('收到客户端传过来的数据：', data);
    // this.ws.emit('message', {
    //   name: this.users[client.id],
    //   say: data,
    // });
  }
  @SubscribeMessage('name')
  /**
   * 监听修改名称
   */
  handleName(client: Socket, data: any): void {
    console.log('handleName', data);
    // this.users[client.id] = data;
    // client.emit('name', this.users[client.id]);
  }

  sendMessage() {
    // console.log(1111, this.users);
    this.ws.emit('message', '你好我是服务器');
  }
}
