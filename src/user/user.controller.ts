import { Body, Controller, Post } from '@nestjs/common';
import { EController } from '../constants/controller';
import { LoginByEmailDto } from './dtos/login-by-email.dto';
import { CacheService } from '../cache/cache.service';
import { UserService } from './user.service';

@Controller(EController.User)
export class UserController {
  //@todo 以下的redis服务今晚移动到user的注册里面
  constructor(
    private readonly cacheService: CacheService,
    private readonly userService: UserService,
  ) {}

  /**
   * 使用邮箱登录 @todo（今晚需要配置邮箱+验证码进行注册）
   * @param loginByEmailDto
   */
  @Post('register_with_email')
  async emailRegistration(
    @Body() loginByEmailDto: LoginByEmailDto,
  ): Promise<any> {
    const { email, password, username, nickname, keepLogin } = loginByEmailDto;
    //this.cacheService.set('email', loginByEmailDto.email);

    const user = await this.userService.emailRegistration(
      email,
      password,
      nickname,
      username,
    );
    return user;
  }
}
