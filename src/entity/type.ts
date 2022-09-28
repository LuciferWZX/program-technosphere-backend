import { User } from './user.entity';

export enum Authority {
  user,
  vip,
  admin,
}
export enum Sex {
  Male,
  Female,
  TwoDimensional, //二次元
}
export enum LoginDevice {
  App,
  Web,
  Mobile,
}
export interface IRedisUserInfo {
  [LoginDevice.App]?: {
    user: User;
    loginTime: string;
  }; //桌面端
  [LoginDevice.Web]?: {
    user: User;
    loginTime: string;
  }; //浏览器端
  [LoginDevice.Mobile]?: {
    user: User;
    loginTime: string;
  }; //移动端
}
