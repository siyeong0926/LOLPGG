import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt } from 'passport-jwt';

// JwtStrategy 클래스는 PassportStrategy를 상속받아 JWT 인증 전략을 구현합니다.
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      // jwtFromRequest: 요청으로부터 JWT를 추출하는 방법을 정의합니다. 여기서는 Bearer 토큰으로부터 추출합니다.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // ignoreExpiration: 토큰 만료를 무시할지 여부를 설정합니다. false로 설정하면 만료된 토큰은 거부됩니다.
      ignoreExpiration: false,

      // secretOrKey: JWT 토큰을 검증할 때 사용할 비밀키 또는 공개키입니다. ConfigService를 통해 환경변수에서 가져옵니다.
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // validate 메소드는 JWT 토큰이 유효한 경우 호출되며, 토큰의 payload를 받아서 사용자 정보를 반환합니다.
  async validate(payload: any) {
    // 여기서는 payload에서 userId와 userEmail을 추출하여 반환합니다.
    // 이 정보는 나중에 요청 객체에 자동으로 첨부됩니다.
    return { userId: payload.id, userEmail: payload.email };
  }
}
