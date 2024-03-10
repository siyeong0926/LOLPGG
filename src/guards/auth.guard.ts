import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt'; // JWT 서비스 임포트

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {} // JwtService 의존성 주입

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1]; // Bearer 토큰 추출

    if (!token) return false;

    try {
      const decoded = this.jwtService.verify(token); // 토큰 검증
      request.user = decoded; // 요청 객체에 사용자 정보 추가
      return true;
    } catch (e) {
      return false; // 토큰 검증 실패 시 false 반환
    }
  }
}
