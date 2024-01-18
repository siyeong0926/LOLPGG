import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const cookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /**
   * @description 쿠키 관련
   * @Param keys - 암호화에 사용
   * @Param [] - 이 안에 있는 문자열을 이용해 쿠키에 저장된 정보를 암호화 / 나중에 개선 해야 함
   */
  app.use(
    cookieSession({
      keys: ['asdfasdf'],
    }),
  );
  //파이프 전역 설정
  app.useGlobalPipes(
    new ValidationPipe({
      //DTO에 정의되지 않은 필드는 자동 제거
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
