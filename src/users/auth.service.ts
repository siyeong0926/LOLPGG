import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * 신규 유저 등록.
   *
   * @param email 사용자 이메일.
   * @param password 사용자 비밀번호.
   * @returns 생성된 사용자 객체를 반환합니다.
   * @throws {BadRequestException} 이미 가입된 이메일이 있는 경우 예외를 발생시킵니다.
   */
  async signup(email: string, password: string) {
    const users = await this.userService.find(email);
    if (users.length) {
      throw new BadRequestException('이미 가입된 이메일 입니다.');
    }

    // 비밀번호 해싱을 위한 솔트 생성 및 해싱 진행
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    const user = await this.userService.create(email, result);
    return user;
  }

  /**
   * 로그인을 처리 / 없는 사용자 , 틀린 비밀번호
   *
   * @param email 사용자 이메일.
   * @param password 사용자 비밀번호.
   * @returns 액세스 토큰을 반환합니다.
   * @throws {NotFoundException} 사용자를 찾을 수 없는 경우 예외를 발생시킵니다.
   * @throws {BadRequestException} 비밀번호가 틀린 경우 예외를 발생시킵니다.
   */
  async login(email: string, password: string) {
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('없는 사용자 입니다');
    }

    // 비밀번호 검증
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('비밀번호가 틀렸습니다');
    }

    // JWT 토큰 생성 및 반환
    const payload = { userId: user.id, userEmail: user.email };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
