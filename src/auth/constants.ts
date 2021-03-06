import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtOptions: JwtModuleOptions = {
  secret: 'wzx-secret',
  signOptions: {
    expiresIn: `${60 * 60 * 24 * 15}s`,
  },
};
