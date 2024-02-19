import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

/**
 *
 * @param TypeOrmModule.forFeature([User]) 이걸 임포트 하는 과정에서 리포지토리 자동 생성
 *
 * @param provide:APP_INTERCEPTOR 전역 인터셉터를 설정함, usermodule 에서 지정된 controllers 에는 전부 적용됨
 *
 * @param useClass:CurrentUserInterceptor 제공 할 인터셉터의 클래스를 지정
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
})
export class UsersModule {}
