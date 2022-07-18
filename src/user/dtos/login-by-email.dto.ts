import { IsEmail } from 'class-validator';

export class LoginByEmailDto {
  @IsEmail({}, { message: '请输入正确的邮箱格式' })
  email: string;
  //@Length(6, 20, { message: '密码长度不能小于6或者大于20' })
  password: string;

  keepLogin: boolean;
}
