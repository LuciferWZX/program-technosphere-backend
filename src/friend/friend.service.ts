import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserFriends } from '../entity/userFriends.entity';
import { UserService } from '../user/user.service';
import { UserFriendRequestRecord } from '../entity/userFriendRequestRecord.entity';
import {
  FriendRequestRecordStatusType,
  ResponseStatusType,
} from '../entity/type';

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
          deletedId: null,
        },
        {
          receiverId: uid,
          deletedId: null,
        },
      ],
    });
    for (let i = 0; i < userFriends.length; i++) {
      const userFriend = userFriends[i];
      const { receiverId, senderId } = userFriend;
      const friendId = userFriend.senderId === uid ? receiverId : senderId;
      userFriend.friendInfo = await this.userService.findUserById(friendId, {
        includeBanned: true,
      });
    }
    return userFriends.filter((userFriend) => {
      if (!query) {
        return true;
      }
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

  /**
   * 发送好友请求
   * @param params
   */
  async sendFriendRequest(params: {
    uid: string;
    fid: string;
    senderDesc?: string;
    senderRemark?: string;
  }): Promise<UserFriendRequestRecord> {
    const { uid, fid, senderDesc } = params;
    ///@todo 首先查看这两人是否是好友
    const friendRecord = await this.userFriendsRepository.findOne({
      where: [
        {
          senderId: uid,
          receiverId: fid,
          deletedId: null,
        },
        {
          senderId: fid,
          receiverId: uid,
          deletedId: null,
        },
      ],
    });
    ///存在说明已经是好友了
    if (friendRecord) {
      throw new HttpException(
        {
          message: '你们已经是好友了',
          code: 10000,
        },
        400,
      );
    }
    ///@todo 两人不是好友就查看是否有请求消息，有的话就不添加记录，没有的话就添加一条记录
    const existRecord = await this.userFriendRequestRecordRepository.findOne({
      where: [
        {
          senderId: uid,
          receiverId: fid,
          responseStatus: Not(ResponseStatusType.Refused),
        },
        {
          senderId: fid,
          receiverId: uid,
          responseStatus: Not(ResponseStatusType.Refused),
        },
      ],
    });
    if (existRecord) {
      let message = '';
      if (existRecord.senderId === uid) {
        if (existRecord.responseStatus === ResponseStatusType.Handling) {
          message = '您已发送该请求，等待对方回应';
        } else if (existRecord.responseStatus === ResponseStatusType.Accepted) {
          message = '你们已经是好友了';
        }
      }
      if (existRecord.receiverId === uid) {
        if (existRecord.responseStatus === ResponseStatusType.Handling) {
          ///当我添加别人的时候发现那个人已经发送了我请求好友的消息，这时候直接就添加了好友
          ///@todo 成功添加好友
        } else if (existRecord.responseStatus === ResponseStatusType.Accepted) {
          message = '你们已经是好友了';
        }
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
      senderDesc: senderDesc,
    });
  }

  /**
   * 查询该用户的好友请求
   * @param params
   */
  async getFriendRecords(params: { id: string }) {
    const { id } = params;
    const recordList = await this.userFriendRequestRecordRepository.find({
      where: [
        {
          receiverId: id,
          deleteStatus: FriendRequestRecordStatusType.ReceiverDeleted,
        },
        {
          senderId: id,
          deleteStatus: FriendRequestRecordStatusType.SenderDeleted,
        },
      ],
    });

    for (let i = 0; i < recordList.length; i++) {
      const record = recordList[i];
      if (record.receiverId === id) {
        ///我是接收人，所有查询senderId的信息
        const friend = await this.userService.findUserById(record.senderId);
        record.friendInfo = {
          id: friend.id,
          nickname: friend.nickname,
          username: friend.username,
          avatar: friend.avatar,
        };
      }
      if (record.senderId === id) {
        ///我是接收人，所有查询senderId的信息
        const friend = await this.userService.findUserById(record.receiverId);
        record.friendInfo = {
          id: friend.id,
          nickname: friend.nickname,
          username: friend.username,
          avatar: friend.avatar,
        };
      }
    }
    console.log(1111, recordList);
    return recordList;
  }
}
