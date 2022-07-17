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
  const onlineUser: any = await cacheService.hGet(
    HashMapKey.OnlineUsersId,
    `online:${user.id}`,
  );
  if (onlineUser) {
    //因为id不变，所以id的会覆盖掉
    //token是新的，所以token就需要把之前的删掉再赋值
    await clearOnlineUser(onlineUser.token, onlineUser.id, cacheService);
  }
  await cacheService.hSet(HashMapKey.OnlineUsersToken, `online:${token}`, {
    ...user,
    token,
  });
  await cacheService.hSet(HashMapKey.OnlineUsersId, `online:${user.id}`, {
    ...user,
    token,
  });
};
/**
 * 删除一个在线用户
 * @param token
 * @param userId
 * @param cacheService
 */
export const clearOnlineUser = async (
  token: string,
  userId: string,
  cacheService: CacheService,
) => {
  await cacheService.hDel(HashMapKey.OnlineUsersToken, `online:${token}`);
  await cacheService.hDel(HashMapKey.OnlineUsersId, `online:${userId}`);
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
