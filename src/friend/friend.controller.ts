import {
  Bind,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { EController } from '../constants/controller';
import { FriendService } from './friend.service';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { getIdFromRequest } from '../utils/util';

@Controller(EController.friend)
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService,
  ) {}

  /**
   * 获取好友列表
   * @param request
   * @param filter
   */
  @Post('get_friends_list')
  @HttpCode(200)
  @Bind(Req())
  async getFriendsList(request: Request, @Body() filter: { query?: string }) {
    const uid = getIdFromRequest(request);
    const { query } = filter;
    return this.friendService.getFriendsList(uid, query);
  }

  /**
   * 发送好友请求
   * @param request
   * @param params
   */
  @Post('send_request')
  @HttpCode(200)
  @Bind(Req())
  async sendRequest(
    request: Request,
    @Body() params: { fid: string; senderDesc?: string; senderRemark?: string },
  ) {
    const uid = getIdFromRequest(request);
    return this.friendService.sendFriendRequest({
      uid,
      ...params,
    });
  }
  @Post('search_users')
  @HttpCode(200)
  @Bind(Req())
  async searchUsers(request: Request, @Body() params: { query?: string }) {
    if (!params.query) {
      return [];
    }
    const uid = getIdFromRequest(request);
    return this.userService.searchUsers({
      uid,
      query: params.query,
    });
  }

  @Get('get_friend_requests')
  @HttpCode(200)
  @Bind(Req())
  async getFriendRequestList(request: Request) {
    const uid = getIdFromRequest(request);
    return this.friendService.getFriendRecords({
      id: uid,
    });
  }
}
