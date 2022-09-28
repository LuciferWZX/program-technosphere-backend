import { User } from '../entity/user.entity';
import { CacheService } from '../cache/cache.service';
import { HashMapKey } from '../types/cache-type';
import { IRedisUserInfo, LoginDevice } from '../entity/type';
import * as dayjs from 'dayjs';

/**
 * 更新redis用户信息
 * @param token
 * @param user
 * @param cacheService
 */
export const updateOnlineUser = async (
  token: string,
  user: User,
  cacheService: CacheService,
) => {
  //先查找redis是否存在该id对应的登录数组
  const userDevices: User[] | undefined = await cacheService.hGet(
    HashMapKey.OnlineUsersId,
    `online:${user.id}`,
  );
  if (userDevices && userDevices.length > 0) {
    //列表有值
    const existUser = userDevices.find((_user) => _user.device === user.device);
    if (existUser) {
      //说明在同一个设备登录的，就替换掉
      await cacheService.hSet(
        HashMapKey.OnlineUsersId,
        `online:${user.id}`,
        userDevices.map((_user) => {
          if (_user.device === user.device) {
            //_user.token是需要删除的token
            cacheService.hDel(
              HashMapKey.OnlineUsersToken,
              `online:${_user.token}`,
            );
            return { ...user, token };
          }
          return _user;
        }),
      );
    } else {
      user.token = token;
      //说明在该设备不存在则concat上去
      await cacheService.hSet(
        HashMapKey.OnlineUsersId,
        `online:${user.id}`,
        userDevices.concat(user),
      );
    }
  } else {
    //说明该用户一次都没有登录过
    await cacheService.hSet(HashMapKey.OnlineUsersId, `online:${user.id}`, [
      { ...user, token },
    ]);
  }
  await cacheService.hSet(HashMapKey.OnlineUsersToken, `online:${token}`, {
    ...user,
    token,
  });
};

//更新在线用户的状态(登录的时候)
export const updateUserStatus = async (
  newUser: User,
  service: CacheService,
) => {
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
  } else {
    const newUserInfo: IRedisUserInfo = {
      [newUser.device]: {
        user: newUser,
        loginTime: dayjs().format(),
      },
    };
    //说明用户没有登录任何设备
    await service.hSet(HashMapKey.Users, newUser.id, newUserInfo);
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
