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
import { ResponseStatusType } from '../entity/type';
import { AppGateway } from '../app.gateway';
import { DataType } from '../types/socketDataType';

@Controller(EController.friend)
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService,
    private readonly appGateway: AppGateway,
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

    const data = await this.friendService.sendFriendRequest({
      uid,
      ...params,
    });
    this.appGateway.wsEmit(params.fid, {
      type: DataType.updateFriendRecord,
    });
    return data;
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
  @Post('handle_friend_request')
  @HttpCode(200)
  @Bind(Req())
  async handleFriendRequest(
    request: Request,
    @Body()
    params: {
      fRecordId: string;
      fid: string;
      status: ResponseStatusType;
      senderRemark?: string;
    },
  ) {
    const uid = getIdFromRequest(request);
    const data = await this.friendService.handleFriendRequest({
      rid: uid,
      ...params,
    });
    this.appGateway.wsEmit(params.fid, {
      type: DataType.updateFriendRecord,
    });
    return data;
  }

  @Post('modify_friend_remark')
  @HttpCode(200)
  @Bind(Req())
  async modifyFriendRemark(
    request: Request,
    @Body()
    params: {
      id: string;
      remark?: string;
    },
  ) {
    const uid = getIdFromRequest(request);

    return this.friendService.modifyFriendRemark({
      id: params.id,
      uid: uid,
      remark: params.remark,
    });
  }
}
