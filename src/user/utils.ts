import { User } from '../entity/user.entity';
import { CacheService } from '../cache/cache.service';
import { HashMapKey } from '../types/cache-type';

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
  // if (onlineUser) {
  //   //因为id不变，所以id的会覆盖掉
  //   //token是新的，所以token就需要把之前的删掉再赋值
  //   await clearOnlineUser(onlineUser.token, onlineUser.id, cacheService);
  // }
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
