export enum DataType {
  //好友请求记录已更新
  updateFriendRecord = 'updateFriendRecord',
  //强制登出
  forceLogout = 'forceLogout',
  //单发一条消息
  singleMsg = 'singleMsg',
}
export interface SocketDataType {
  type: DataType;
  data?: any;
  msg?: string;
}
