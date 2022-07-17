import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtOptions } from './constants';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register(jwtOptions)],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
