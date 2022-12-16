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

export enum ResponseStatusType {
  Refused = 0, //以拒绝
  Accepted = 1, //已接受
  Handling = 2, //处理中
}
export enum FriendRequestRecordStatusType {
  NotDeleted = 0, //两者都没有删除这个记录
  SenderDeleted = 1, //发送者删除这个记录
  ReceiverDeleted = 2, //接收者删除这个记录
  BothDeleted = 3, //都删除这个记录
}
export enum ContentType {
  text, //文本
  image, //图片
  video, //视频
  voice, //语音
}
export enum Result {
  No = 0, //否
  Yes = 1, //是
}
