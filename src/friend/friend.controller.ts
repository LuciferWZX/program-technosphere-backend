import { Body, Controller, Post } from '@nestjs/common';
import { EController } from '../constants/controller';
import { FriendService } from '../friend/friend.service';

@Controller(EController.friend)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('get_friends_list')
  async getFriendsList(@Body() filter: { uid: string; query?: string }) {
    const { uid, query } = filter;
    return this.friendService.getFriendsList(uid, query);
  }
  @Post('send_request')
  async sendRequest(
    @Body() request: { uid: string; fid: string; desc?: string },
  ) {
    return this.friendService.sendFriendRequest(request);
  }
}
