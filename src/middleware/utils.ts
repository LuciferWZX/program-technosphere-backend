import { CacheService } from '../cache/cache.service';
import { AuthService } from '../auth/auth.service';
import { removeUser } from '../user/utils';
import { HashMapKey } from '../types/cache-type';
import { parseJwt } from '../utils/parseJWT';
import { IDeviceInfo, IRedisUserInfo } from '../entity/type';
import { HttpException } from '@nestjs/common';

// export const tokenVerify = async (
//   token: string,
//   cacheService: CacheService,
//   authService: AuthService,
// ) => {
//   const user: User | undefined = await getOnlineUser(
//     token,
//     HashMapKey.OnlineUsersToken,
//     cacheService,
//   );
//
//   //说明用户存在
//   if (user) {
//     //辅助校验这个用户是否过期
//     authService.validate(token).catch((_) => {
//       //说明已过期，删除掉redis里面的数据
//       clearOnlineUser(token, user, cacheService);
//       return user;
//     });
//   }
//   return user;
// };
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
  console.log(11111, token);
  console.log(111112, userId);
  console.log(2222, user);
  if (user) {
    //先检查是否有登录的账号设备
    for (const device in user) {
      const deviceInfo: IDeviceInfo = user[device];
      //当前登录的用户和正在获取接口的用户是否是最新的
      if (`Bearer ${deviceInfo.user.token}` === tempToken) {
        pass = true;
        tempToken = deviceInfo.user.token;
        break;
      } else {
        throw new HttpException(
          {
            message: 'token已过期,请重新登录',
            code: 10000,
          },
          401,
        );
      }
    }
    //如果有则再检查token是否过期了
    if (pass) {
      await authService.validate(tempToken).catch(() => {
        console.log('过期...');
        //说明已过期，删除掉redis里面的数据
        removeUser(tempToken, cacheService);
        return user;
      });
    }
  }
  return user;
};
