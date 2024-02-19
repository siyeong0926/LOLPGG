import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private userService: UsersService) {}

  /**
   *
   * @param request.session || {}; - {} 를 붙여주는 이유는
   * request.session 이 null , undefined 인 경우에 안전하게 처리가 가능하기 때문
   * js 는 객체 속성에 접근 할 때 객체가 null undefined 인 경우에 타입 에러가 발생함
   * 하지만 || {} 를 추가 해주면 이런 문제를 방지 해주는데
   * request.session 이 존재 하지 않을 때 빈 객체를 반환해서
   * 코드가 계속 실행 될 수 있도록 해주는 것
   * 이는 서버에서 예기치 않은 오류가 발생 하는 것을 방지하는데 도움이 된다.
   */
  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.session || {};

    /**
     * @description userId가 정의 되지 않으 (false,null,undefined) 같은 상태면
     * UserService 로 쿼리를 수행 할 필요 자체가 없어짐, 사용자는 로그인 상태가 아니기 때문
     * @param if 조건문으로 userId 가 존재하는지 확인하고 정의 됐으면 쿼리를 날림
     * @param handler.handle() 대상 라우트 핸들러를 실행 하라는 의미
     * @param request.currentUser=user; 아이디 조회 후 UserService 로 해당 정보 찾고 request에 저장
     * 데코레이터에서는 request 를 이용해서 currentUser 를 취득 하고 그 정보를 반환함
     */
    if (userId) {
      const user = await this.userService.findOne(userId);
      request.currentUser = user;
    }
    return handler.handle();
  }
}
