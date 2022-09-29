import { User } from '../entity/user.entity';
import { CacheService } from '../cache/cache.service';
import { HashMapKey } from '../types/cache-type';
import { IDeviceInfo, IRedisUserInfo, LoginDevice } from '../entity/type';
import * as dayjs from 'dayjs';
import { parseJwt } from '../utils/parseJWT';

//更新在线用户的状态(登录的时候)
export const updateUserStatus = async (
  newUser: User,
  service: CacheService,
): Promise<{ action: 'update' | 'online' }> => {
  //查询用户在该设备上是否登录
  const userInfo: IRedisUserInfo | undefined = await service.hGet(
    HashMapKey.Users,
    newUser.id,
  );
  if (userInfo?.[newUser.device]) {
    //存在说明该用户是已经登录过的
    userInfo[newUser.device] = {
      user: newUser,
      loginTime: dayjs().format(),
    };
    //将新的用户信息更新上去
    await service.hSet(HashMapKey.Users, newUser.id, userInfo);
    return {
      action: 'update',
    };
  } else {
    const newUserInfo: IRedisUserInfo = {
      [newUser.device]: {
        user: newUser,
        loginTime: dayjs().format(),
      },
    };
    //说明用户没有登录任何设备
    await service.hSet(HashMapKey.Users, newUser.id, newUserInfo);
    return {
      action: 'online',
    };
  }
};

export const removeUser = async (token: string, service: CacheService) => {
  const jwt = parseJwt(token);
  const { sub: userId } = jwt;
  const user: IRedisUserInfo | undefined = await service.hGet(
    HashMapKey.Users,
    userId,
  );
  if (user) {
    const newUser = {
      ...user,
    };
    for (const device in user) {
      const deviceInfo: IDeviceInfo = user[device];
      if (deviceInfo.user.token !== token) {
        newUser[device] = user[device];
      }
    }
    //将新的用户信息更新上去
    await service.hSet(HashMapKey.Users, userId, newUser);
  }
};
/**
 * 删除一个在线用户
 * @param token
 * @param user
 * @param cacheService
 */
export const clearOnlineUser = async (
  token: string,
  user: User,
  cacheService: CacheService,
) => {
  await cacheService.hDel(HashMapKey.OnlineUsersToken, `online:${token}`);
  console.log('当前清空的token:', `online:${token}`);
  const userDevices: User[] | undefined = await cacheService.hGet(
    HashMapKey.OnlineUsersId,
    `online:${user.id}`,
  );
  if (userDevices && userDevices.length > 0) {
    const finalUserDevice = userDevices.filter(
      (_user) => _user.device !== user.device,
    );
    if (finalUserDevice.length === 0) {
      await cacheService.hDel(HashMapKey.OnlineUsersId, `online:${user.id}`);
    } else {
      //过滤掉这个
      await cacheService.hSet(
        HashMapKey.OnlineUsersId,
        `online:${user.id}`,
        finalUserDevice,
      );
    }
  } else {
    //长度为0则清空
    await cacheService.hDel(HashMapKey.OnlineUsersId, `online:${user.id}`);
  }
};
/**
 * 通过token获取redis上的用户
 * @param token
 * @param type
 * @param cacheService
 */
export const getOnlineUser = async (
  token: string,
  type: HashMapKey.OnlineUsersId | HashMapKey.OnlineUsersToken,
  cacheService: CacheService,
): Promise<User | undefined> => {
  return await cacheService.hGet(
    HashMapKey.OnlineUsersToken,
    `online:${token}`,
  );
};
