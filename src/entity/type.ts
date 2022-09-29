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

export interface IDeviceInfo {
  user: User;
  loginTime: string;
}
export interface IRedisUserInfo {
  [LoginDevice.App]?: IDeviceInfo; //桌面端
  [LoginDevice.Web]?: IDeviceInfo; //浏览器端
  [LoginDevice.Mobile]?: IDeviceInfo; //移动端
}
