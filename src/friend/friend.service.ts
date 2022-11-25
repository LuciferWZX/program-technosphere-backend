import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { UserFriends } from '../entity/userFriends.entity';
import { UserService } from '../user/user.service';
import { UserFriendRequestRecord } from '../entity/userFriendRequestRecord.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(UserFriends)
    private readonly userFriendsRepository: Repository<UserFriends>,
    @InjectRepository(UserFriendRequestRecord)
    private readonly userFriendRequestRecordRepository: Repository<UserFriendRequestRecord>,

    private readonly userService: UserService,
  ) {}

  /**
   * 查询好友列表
   * @param uid
   * @param query
   */
  async getFriendsList(uid: string, query?: string) {
    const userFriends = await this.userFriendsRepository.find({
      where: [
        {
          senderId: uid,
        },
        {
          receiverId: uid,
        },
      ],
    });
    for (let i = 0; i < userFriends.length; i++) {
      const userFriend = userFriends[i];
      const { receiverId, senderId } = userFriend;
      const friendId = userFriend.senderId === uid ? receiverId : senderId;
      userFriend.friendInfo = await this.userService.findUserByCondition(
        friendId,
        {
          includeBanned: true,
        },
      );
    }
    return userFriends.filter((userFriend) => {
      const { receiverId, senderId, friendInfo, senderRemark, receiverRemark } =
        userFriend;

      if (friendInfo.id === receiverId) {
        //先看备注是否包含文字
        if (senderRemark.includes(query)) {
          return true;
        }
        //再看用户的用户名和昵称和电话号码是否包含
        const { nickname, username, phone } = friendInfo;
        return (
          nickname.includes(query) ||
          username.includes(query) ||
          phone === query
        );
      }
      if (friendInfo.id === senderId) {
        //先看备注是否包含文字
        if (receiverRemark.includes(query)) {
          return true;
        }
        //再看用户的用户名和昵称和电话号码是否包含
        const { nickname, username, phone } = friendInfo;
        return (
          nickname.includes(query) ||
          username.includes(query) ||
          phone === query
        );
      }
    });
  }

  async sendFriendRequest(params: {
    uid: string;
    fid: string;
    desc?: string;
  }): Promise<UserFriendRequestRecord> {
    const { uid, fid, desc } = params;
    const existRecord = await this.userFriendRequestRecordRepository.findOne({
      where: [
        {
          senderId: uid,
          receiverId: fid,
        },
        {
          senderId: fid,
          receiverId: uid,
        },
      ],
    });
    if (existRecord) {
      let message = '';
      if (existRecord.senderId === uid) {
        message = '您已发送该请求，等待对方回应';
      }
      if (existRecord.receiverId === uid) {
        message = '对方已发送请求，等待您的回应';
      }
      throw new HttpException(
        {
          message: message,
          code: 10000,
        },
        400,
      );
    }
    return await this.userFriendRequestRecordRepository.save({
      senderId: uid,
      receiverId: fid,
      senderDesc: desc,
    });
  }
}
