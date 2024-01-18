import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { plainToInstance } from 'class-transformer';

/**
 * @interface ClassConstructor
 * @description 새로운 인스턴스를 생성하는 클래스 생성자 인터페이스
 */
interface ClassConstructor {
  new (...args: any[]): {};
}

/**
 * @function Serialize
 * @description SerializeInterceptor를 사용하는 데코레이터를 반환하는 함수
 * @param {ClassConstructor} dto - 데이터 전송 객체(DTO)
 * @returns {Function} - UseInterceptors 데코레이터를 반환
 */
export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

/**
 * @class SerializeInterceptor
 * @description 응답 데이터를 지정된 DTO 형태로 변환하는 NestJS 인터셉터
 * @implements {NestInterceptor}
 */
export class SerializeInterceptor implements NestInterceptor {
  /**
   * @constructor
   * @param {any} dto - 데이터 전송 객체(DTO)
   */
  constructor(private dto: any) {}

  /**
   * @method intercept
   * @description 리퀘스트 핸들러로 들어오는 요청이 처리되기 전과 응답 데이터가 나가기 전에 실행되는 메소드
   * @param {ExecutionContext} context - 실행 컨텍스트
   * @param {CallHandler<any>} handle - 호출 핸들러
   * @returns {Observable<any> | Promise<Observable<any>>} - Observable을 반환
   */
  intercept(
    context: ExecutionContext,
    handle: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return handle.handle().pipe(
      map((data: any) => {
        // 응답 데이터를 DTO 형태로 변환하여 반환
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
