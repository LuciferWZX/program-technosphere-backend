import { CacheService } from '../cache/cache.service';
import { AuthService } from '../auth/auth.service';
import { clearOnlineUser, getOnlineUser, removeUser } from '../user/utils';
import { HashMapKey } from '../types/cache-type';
import { User } from '../entity/user.entity';
import { parseJwt } from '../utils/parseJWT';
import { IDeviceInfo, IRedisUserInfo } from '../entity/type';

export const tokenVerify = async (
  token: string,
  cacheService: CacheService,
  authService: AuthService,
) => {
  const user: User | undefined = await getOnlineUser(
    token,
    HashMapKey.OnlineUsersToken,
    cacheService,
  );
  //说明用户存在
  if (user) {
    //辅助校验这个用户是否过期
    authService.validate(token).catch((_) => {
      //说明已过期，删除掉redis里面的数据
      clearOnlineUser(token, user, cacheService);
      return user;
    });
  }
  return user;
};
export const verifyToken = async (
  token: string,
  cacheService: CacheService,
  authService: AuthService,
) => {
  const jwt = parseJwt(token);
  const { sub: userId } = jwt;
  let pass = false;
  let tempToken = token;
  const user: IRedisUserInfo | undefined = await cacheService.hGet(
    HashMapKey.Users,
    userId,
  );

  if (user) {
    //先检查是否有登录的账号设备
    for (const device in user) {
      const deviceInfo: IDeviceInfo = user[device];

      if (`Bearer ${deviceInfo.user.token}` === tempToken) {
        pass = true;
        tempToken = deviceInfo.user.token;
        break;
      }
    }
    //如果有则再检查token是否过期了
    if (pass) {
      await authService.validate(tempToken).catch(() => {
        //说明已过期，删除掉redis里面的数据
        removeUser(tempToken, cacheService);
        return user;
      });
    }
  }
  return user;
};
