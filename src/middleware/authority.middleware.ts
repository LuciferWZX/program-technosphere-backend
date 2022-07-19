import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { tokenVerify } from './utils';
import { CacheService } from '../cache/cache.service';
@Injectable()
export class AuthorityMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.header('authorization');
    //验证token是否正确
    const user = await tokenVerify(token, this.cacheService, this.authService);
    console.log('权限校验...', user);
    if (user === undefined) {
      throw new HttpException(
        {
          message: '该用户已过期，请重新登录',
          code: 10000,
        },
        401,
      );
    }
    next();
  }
}
