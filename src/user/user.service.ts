import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { ILike, In, Not, Repository } from 'typeorm';
import { CacheService } from '../cache/cache.service';
import { clearOnlineUser, getOnlineUser } from './utils';
import { HashMapKey } from '../types/cache-type';

import { UserFriendRequestRecord } from '../entity/userFriendRequestRecord.entity';
import { FriendRequestRecordStatusType } from '../entity/type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserFriendRequestRecord)
    private readonly userFriendRequestRecordRepository: Repository<UserFriendRequestRecord>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 使用邮箱注册
   * @param email
   * @param password
   * @param nickname
   * @param username
   * @param pin
   * @param phone
   */
  async emailRegistration(
    email: string,
    password: string,
    nickname: string,
    username: string,
    pin: string,
    phone: string,
  ): Promise<User> {
    const existUser = await this.userRepository.findOne({
      where: [
        {
          email: email,
        },
        {
          nickname: nickname,
        },
        {
          username: username,
        },
        {
          phone: phone,
        },
      ],
    });
    if (existUser) {
      let message = '已有用户注册';
      if (existUser.phone === phone) {
        message = '该手机已存在';
      } else if (existUser.email === email) {
        message = '该邮箱已存在';
      } else if (existUser.nickname === nickname) {
        message = '该昵称已存在';
      } else if (existUser.username === username) {
        message = '该用户名已存在';
      }
      throw new HttpException(
        {
          message: message,
          code: 10000,
        },
        400,
      );
    }

    return this.userRepository.save({
      email,
      phone,
      password,
      nickname,
      pin,
      username,
    });
  }

  /**
   * 使用邮箱登录
   * @param email
   * @param password
   */
  async emailLogin(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
        password: password,
      },
    });
    if (!user) {
      //说明没有注册过，或者邮箱密码错误
      throw new HttpException(
        {
          message: '邮箱或者密码错误，请输入正确的邮箱和密码',
          code: 10001,
        },
        402,
      );
    }
    if (user.banned) {
      //说明用户被ban了，无法使用，需要联系管理员去询问原因
      throw new HttpException(
        {
          message: '该用户已被禁用，请联系管理员',
          code: 10002,
        },
        402,
      );
    }
    return user;
  }

  /**
   * 使用手机和PIN码登录
   * @param phone
   * @param pin
   */
  async phoneLogin(phone: string, pin: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        pin: pin,
        phone: phone,
      },
    });
    if (!user) {
      //说明没有注册过，或者手机和PIN错误
      throw new HttpException(
        {
          message: '电话号码或者PIN码错误',
          code: 10001,
        },
        402,
      );
    }
    if (user.banned) {
      //说明用户被ban了，无法使用，需要联系管理员去询问原因
      throw new HttpException(
        {
          message: '该用户已被禁用，请联系管理员',
          code: 10002,
        },
        402,
      );
    }
    return user;
  }

  /**
   * 退出登录，清除redis的在线该用户
   * @param token
   */
  async logout(token: string): Promise<boolean> {
    //先通过token查找该用户
    const user = await getOnlineUser(
      token,
      HashMapKey.OnlineUsersToken,
      this.cacheService,
    );
    if (user) {
      await clearOnlineUser(token, user, this.cacheService);
    }
    return true;
  }

  /**
   * 通过token查找用户信息
   * @param token
   */
  async fetchUserInfoByToken(token: string): Promise<User> {
    //先通过token查找该用户
    const user = await getOnlineUser(
      token,
      HashMapKey.OnlineUsersToken,
      this.cacheService,
    );
    if (!user) {
      throw new HttpException(
        {
          message: '该用户已过期，请重新登录',
          code: 10001,
        },
        401,
      );
    }
    return user;
  }

  /**
   *
   * @param uId 用户的id
   * @param config
   */
  async findUserById(
    uId: string,
    config?: {
      includeBanned?: boolean;
      query?: string;
      precise?: boolean;
    },
  ) {
    const condition: any = {};
    if (!config?.includeBanned) {
      condition.banned = Not(true);
    }
    return await this.userRepository.findOne({
      where: [
        {
          id: uId,
          username: config?.precise
            ? config.query
            : ILike(`%${config?.query ?? ''}%`),
          ...condition,
        },
        {
          id: uId,
          nickname: config?.precise
            ? config?.query
            : ILike(`%${config?.query ?? ''}%`),
          ...condition,
        },
        {
          id: uId,
          phone: config?.query,
          ...condition,
        },
        {
          id: uId,
          email: config?.precise
            ? config?.query
            : ILike(`%${config?.query ?? ''}%`),
          ...condition,
        },
      ],
    });
  }

  async searchUsers(params: {
    uid: string;
    query?: string;
    includeSelf?: boolean;
  }) {
    const { query, uid, includeSelf } = params;
    const condition: any = {};
    if (!includeSelf) {
      condition.id = Not(uid);
    }
    const users = await this.userRepository.find({
      where: [
        { email: query, ...condition },
        { nickname: ILike(`%${query ?? ''}%`), ...condition },
        { username: query, ...condition },
        { phone: query, ...condition },
      ],
    });
    return users;
  }

  async getUserDetail(params: { uid: string }) {
    const { uid } = params;
    return await this.userRepository.findOne({
      where: {
        id: uid,
      },
    });
  }
}
