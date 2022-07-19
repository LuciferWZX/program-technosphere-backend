import { Bind, Body, Controller, Get, Post, Req } from '@nestjs/common';
import { EController } from '../constants/controller';
import { LoginByEmailDto } from './dtos/login-by-email.dto';
import { CacheService } from '../cache/cache.service';
import { UserService } from './user.service';
import { RegisterByEmailDto } from './dtos/register-by-email.dto';
import { AuthService } from '../auth/auth.service';
import { updateOnlineUser } from './utils';

@Controller(EController.User)
export class UserController {
  //@todo 以下的redis服务今晚移动到user的注册里面
  constructor(
    private readonly cacheService: CacheService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * 使用邮箱注册 @todo（今晚需要配置邮箱+验证码进行注册）
   * @param registerByEmailDto
   */
  @Post('register_with_email')
  async emailRegistration(
    @Body() registerByEmailDto: RegisterByEmailDto,
  ): Promise<any> {
    const { email, password, username, nickname } = registerByEmailDto;
    //this.cacheService.set('email', loginByEmailDto.email);

    return await this.userService.emailRegistration(
      email,
      password,
      nickname,
      username,
    );
  }

  /**
   * 使用邮箱密码进行登录
   * @param loginByEmail
   */
  @Post('login_with_email')
  async emailLogin(@Body() loginByEmail: LoginByEmailDto) {
    const { email, password, keepLogin } = loginByEmail;
    if (keepLogin) {
      //@todo
    }
    const user = await this.userService.emailLogin(email, password);
    const token = await this.authService.generateToken(user.username, user.id);
    await updateOnlineUser(token, user, this.cacheService);
    return {
      ...user,
      token: token,
    };
  }
  @Post('logout')
  @Bind(Req())
  async logout(request) {
    const token = request.headers?.authorization;
    if (token) {
      await this.userService.logout(token);
    }
    return null;
  }
  @Get('/test')
  async test() {
    return 'this is test';
  }
}
