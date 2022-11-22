import { IsEmail, IsPhoneNumber, Length } from 'class-validator';

export class RegisterByEmailDto {
  @IsEmail({}, { message: '请输入正确的邮箱格式' })
  email: string;
  @IsPhoneNumber('CN', { message: '请输入正确的手机号码' })
  phone: string;
  @Length(6, 20, { message: '密码长度不能小于6或者大于20' })
  password: string;
  @Length(1, 28, { message: '用户名长度不能小于1或者大于28' })
  username: string;
  @Length(1, 18, { message: '昵称长度不能小于1大于18' })
  nickname: string;
  @Length(4, 4, { message: 'pin码是4位数' })
  pin: string;
}
