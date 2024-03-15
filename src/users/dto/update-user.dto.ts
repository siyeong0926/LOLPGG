import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';

//@IsOptional() 데코는 해당 필드를 필수가 아닌 선택적 요소로 만들어줌
// 예를 들어, 회원가입시 이메일,비밀번호는 필수라면 핸드폰 번호는 선택 요소일 때 @IsOptional() 를 붙여주면 됨

/**
 * @this PartialType PartialType은 NestJS에서 DTO(Data Transfer Object)를
 * 작성할 때 사용하는 유틸리티 타입입니다.
 * TypeScript에서 Partial<T>는 T의 모든 프로퍼티를 선택적으로 만드는 유틸리티 타입입니다.
 * 즉, 이 타입을 사용하면 기존 타입의 모든 프로퍼티가 필수가 아닌
 * 선택적 프로퍼티로 변환됩니다. NestJS의 PartialType()
 * 함수는 이 개념을 확장하여, 한 DTO를 기반으로 새 DTO를 생성하되,
 * 모든 프로퍼티를 선택적으로 만들 때 사용됩니다.
 *
 * 예를 들어, 사용자의 데이터를 업데이트하는 경우,
 * 모든 필드를 필수로 요구하지 않고 변경하고자 하는
 * 필드만 받고 싶을 때 PartialType을 사용할 수 있습니다.
 * 기존의 전체 사용자 DTO에서 몇 가지 필드만 업데이트하고자
 * 하는 상황이 이에 해당합니다.
 */

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;
}
