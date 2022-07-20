import { LoginDevice } from '../entity/type';

/**
 * 是桌面应用登录还是Web端或者是移动端
 * @param userAgent
 */
export const getDevice = (userAgent: string): LoginDevice => {
  if (userAgent.includes('electron/')) {
    return LoginDevice.App;
  }
  return LoginDevice.Web;
};
