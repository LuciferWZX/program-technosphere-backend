import { CacheService } from '../cache/cache.service';
import { AuthService } from '../auth/auth.service';
import { clearOnlineUser, getOnlineUser } from '../user/utils';
import { HashMapKey } from '../types/cache-type';
import { User } from '../entity/user.entity';

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
