import { Bind, Body, Controller, Post, Req } from '@nestjs/common';
import { EController } from '../constants/controller';
import { FriendService } from './friend.service';
import { Request } from 'express';

@Controller(EController.friend)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('get_friends_list')
  @Bind(Req())
  async getFriendsList(request: Request, @Body() filter: { query?: string }) {
    const uid = request.headers['authorization'];
    const { query } = filter;
    return this.friendService.getFriendsList(uid, query);
  }
  @Post('send_request')
  @Bind(Req())
  async sendRequest(
    request: Request,
    @Body() params: { fid: string; desc?: string },
  ) {
    const uid = request.headers['authorization'];
    return this.friendService.sendFriendRequest({
      uid,
      ...params,
    });
  }
}
