import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtOptions } from './constants';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async validate(token: string) {
    //@todo
    this.jwtService.verify(token, {
      secret: jwtOptions.secret,
    });
  }

  /**
   * 通过用户名和用户id生成token
   * @param username
   * @param userId
   */
  async generateToken(username: string, userId: string): Promise<string> {
    const payload = { username, sub: userId };
    return this.jwtService.sign(payload);
  }
}
