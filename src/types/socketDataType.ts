export enum DataType {
  //好友请求记录已更新
  updateFriendRecord = 'updateFriendRecord',
}
export interface SocketDataType {
  type: DataType;
  data?: any;
  msg?: string;
}
