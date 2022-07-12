import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    console.log(existUser);
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
}
