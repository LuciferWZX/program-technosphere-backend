import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { ILike, Like, Repository } from 'typeorm';
import { UserFriends } from '../entity/userFriends.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(UserFriends)
    private readonly userFriendsRepository: Repository<UserFriends>,

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
}
