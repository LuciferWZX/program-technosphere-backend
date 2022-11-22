import { IsPhoneNumber, Length } from 'class-validator';

export class LoginByPhoneDto {
  //@IsPhoneNumber('CN', { message: '请输入正确的手机格式' })
  phone: string;
  //@Length(4, 4, { message: '请输入4位PIN码' })
  pin: string;
}
