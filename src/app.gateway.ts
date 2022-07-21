import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
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
  private logger: Logger = new Logger('ChatGateway');
  @WebSocketServer() private ws: Server; // socket实例
  private connectCounts = 0; // 当前在线人数
  private allNum = 0; // 全部在线人数
  private users: any = {}; // 人数信息

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
  handleConnection(client: Socket) {
    const auth: { [p: string]: any } = client.handshake.auth;
    this.logger.log('登录的用户：', auth.token);
    this.connectCounts += 1;
    this.allNum += 1;
    this.users[client.id] = `user-${this.connectCounts}`;
    this.ws.emit('enter', {
      name: this.users[client.id],
      allNum: this.allNum,
      connectCounts: this.connectCounts,
    });
    client.emit('enterName', this.users[client.id]);
  }

  /**
   * 断开连接
   * @param client
   */
  handleDisconnect(client: Socket) {
    this.allNum -= 1;
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
    this.ws.emit('message', {
      name: this.users[client.id],
      say: data,
    });
  }
  @SubscribeMessage('name')
  /**
   * 监听修改名称
   */
  handleName(client: Socket, data: any): void {
    this.users[client.id] = data;
    client.emit('name', this.users[client.id]);
  }
}
