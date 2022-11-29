import {
  Bind,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { EController } from '../constants/controller';
import { LoginByEmailDto } from './dtos/login-by-email.dto';
import { CacheService } from '../cache/cache.service';
import { UserService } from './user.service';
import { RegisterByEmailDto } from './dtos/register-by-email.dto';
import { AuthService } from '../auth/auth.service';
import { updateUserStatus } from './utils';
import { getDevice } from '../utils/util';
import { User } from '../entity/user.entity';
import { LoginByPhoneDto } from './dtos/login-by-phone.dto';

@Controller(EController.User)
export class UserController {
  //@todo 以下的redis服务今晚移动到user的注册里面
  constructor(
    private readonly cacheService: CacheService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('fetch_user_info')
  @Bind(Req())
  async fetchUserInfo(request) {
    const token = request.headers?.authorization;
    return await this.userService.fetchUserInfoByToken(token);
  }

  /**
   * 使用邮箱注册 @todo（今晚需要配置邮箱+验证码进行注册）
   * @param registerByEmailDto
   */
  @Post('register_with_email')
  async emailRegistration(
    @Body() registerByEmailDto: RegisterByEmailDto,
  ): Promise<any> {
    const { email, password, username, nickname, pin, phone } =
      registerByEmailDto;
    //this.cacheService.set('email', loginByEmailDto.email);
    return await this.userService.emailRegistration(
      email,
      password,
      nickname,
      username,
      pin,
      phone,
    );
  }

  /**
   * 使用邮箱密码进行登录
   * @param request
   * @param loginByEmail
   */
  @Post('login_with_email')
  @HttpCode(200)
  @Bind(Req())
  async emailLogin(request, @Body() loginByEmail: LoginByEmailDto) {
    const { email, password, keepLogin } = loginByEmail;
    if (keepLogin) {
      //@todo
    }
    //先检查用户📪和密码是否正确
    const user = await this.userService.emailLogin(email, password);
    //生成token
    const token = await this.authService.generateToken(user.username, user.id);
    //当前登录的设备
    const deviceAgent = request.headers['user-agent'].toLowerCase();
    user.device = getDevice(deviceAgent);
    user.token = token;
    //-----------处理redis里面的用户
    await this.handleUserLogin(user);
    //可以插入数据库
    return {
      ...user,
      token: token,
    };
  }

  @Post('login_with_phone')
  @HttpCode(200)
  @Bind(Req())
  async phoneLogin(request, @Body() loginByPhoneDto: LoginByPhoneDto) {
    const { phone, pin } = loginByPhoneDto;
    //先检查用户📪和密码是否正确
    const user = await this.userService.phoneLogin(phone, pin);
    //生成token
    const token = await this.authService.generateToken(user.username, user.id);
    //当前登录的设备
    const deviceAgent = request.headers['user-agent'].toLowerCase();
    user.device = getDevice(deviceAgent);
    user.token = token;
    //-----------处理redis里面的用户
    await this.handleUserLogin(user);
    //可以插入数据库
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

  async handleUserLogin(user: User) {
    const result = await updateUserStatus(user, this.cacheService);
    if (result.action === 'update') {
      console.log('update,发送socket信息给当前登录的用户，提示他被踢出了');
    } else {
      console.log('insert');
    }
  }

  @Post('get_user_details')
  @HttpCode(200)
  async getUserDetails(@Body() params: { uid: string }) {
    return this.userService.getUserDetail({
      uid: params.uid,
    });
  }
}
