import { Body, Controller, Post } from '@nestjs/common';
import { EController } from '../constants/controller';
import { LoginByEmailDto } from './dtos/login-by-email.dto';
import { CacheService } from '../cache/cache.service';

@Controller(EController.User)
export class UserController {
  //@todo 以下的redis服务今晚移动到user的注册里面
  constructor(private readonly cacheService: CacheService) {}
  @Post('login_with_email')
  loginByEmail(@Body() loginByEmailDto: LoginByEmailDto): any {
    console.log(222, loginByEmailDto.email);
    this.cacheService.set('email', loginByEmailDto.email);
    return loginByEmailDto;
  }
}
