import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { CacheService } from '../cache/cache.service';
import { clearOnlineUser, getOnlineUser } from './utils';
import { HashMapKey } from '../types/cache-type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 使用邮箱注册
   * @param email
   * @param password
   * @param nickname
   * @param username
   */
  async emailRegistration(
    email: string,
    password: string,
    nickname: string,
    username: string,
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
      ],
    });
    if (existUser) {
      let message = '';
      if (existUser.email === email) {
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
      password,
      nickname,
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
        401,
      );
    }
    if (user.banned) {
      //说明用户被ban了，无法使用，需要联系管理员去询问原因
      throw new HttpException(
        {
          message: '该用户已被禁用，请联系管理员',
          code: 10002,
        },
        401,
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
}
