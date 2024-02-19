import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @description @CurrentUser() 데코레이터 만들기
 * @param data - @CurrentUser() 컨트롤러에서 여기에 뭘 넣던지 data 인수에 담음
 * @param context - context 인수는 ExecutionContext 객체, 현재 들어온 요청에 대한 정보를 담음
 * @method context.switchToHttp() HTTP 요청과 응답 객체에 접근 할 수 있는 객체 반환
 * @method .getRequest() HTTP 요청 객체 반환, 클라이언트로부터 HTTP 요청에 대한 정보를 담은 요청 객체를 얻을 수 있음
 * @param request 애플리케이션으로 들어온 요청 자체에 접근 할 수 있게됨
 * @param request.session.userId 세선에서 정보를 얻을 수 있음(userId)
 */
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.currentUser;
  },
);
