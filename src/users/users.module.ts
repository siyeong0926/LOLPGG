import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';

/**
 *
 * @param TypeOrmModule.forFeature([User]) 이걸 임포트 하는 과정에서 리포지토리 자동 생성
 *
 * @param provide:APP_INTERCEPTOR 전역 인터셉터를 설정함, usermodule 에서 지정된 controllers 에는 전부 적용됨
 *
 * @param useClass:CurrentUserInterceptor 제공 할 인터셉터의 클래스를 지정
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    /**
     * @description Jwt 임포트 관련
     * @this secret:process.env.JWT_SECRET 시크릿 키 지정
     * @this signOptions:{expiresIn:'24h'} 유효 기간 지정
     */
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sv8vrie837dnxmxkw938tkgkdmc9e9gkrgkf',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
  exports: [AuthService],
})
export class UsersModule {}
