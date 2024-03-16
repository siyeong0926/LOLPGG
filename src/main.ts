import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const cookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  /**
   * @description 쿠키 관련
   * @Param keys - 암호화에 사용
   * @Param [] - 이 안에 있는 문자열을 이용해 쿠키에 저장된 정보를 암호화 / 나중에 개선 해야 함
   */

  const config = new DocumentBuilder()
    .setTitle('Example API')
    .setDescription('The example API description')
    .setVersion('1.0')
    .addTag('example')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, '..', 'view'));
  app.setBaseViewsDir(join(__dirname, '..', 'view'));

  hbs.registerPartials(join(__dirname, '..', 'view', 'partials'));

  hbs.registerHelper('inc', function (value) {
    return parseInt(value) + 1;
  });

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
