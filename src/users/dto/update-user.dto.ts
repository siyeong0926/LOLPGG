import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';

//@IsOptional() 데코는 해당 필드를 필수가 아닌 선택적 요소로 만들어줌
// 예를 들어, 회원가입시 이메일,비밀번호는 필수라면 핸드폰 번호는 선택 요소일 때 @IsOptional() 를 붙여주면 됨

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;
}
