import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Report } from './reports/entities/report.entity';
import { SearchModule } from './search/search.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    ReportsModule,
    SearchModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // 데이터베이스 타입을 'sqlite'에서 'postgres'로 변경
      host: 'localhost', // PostgreSQL 서버의 호스트 (배포 환경에 따라 변경 필요)
      port: 5432, // PostgreSQL의 기본 포트
      username: 'postgres', // 데이터베이스 사용자 이름
      password: 'postgres', // 사용자 비밀번호
      database: 'mypgdb', // 데이터베이스 이름
      entities: [User, Report],
      synchronize: true, // 개발 단계에서만 사용. 프로덕션에서는 사용하지 않는 것을 권장
    }),
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
