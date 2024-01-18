import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

/**
 * promise 기반으로 작동하는 scrypt 를 이름 그대로 호출하기 위해서
 * import 부분과 아래 코드가 추가된다.
 */
const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    // 이메일이 이미 사용 중인지 확인하기
    const users = await this.userService.find(email);
    if (users.length) {
      throw new BadRequestException('이미 가입된 이메일 입니다.');
    }

    /**
     * @description slat 를 생성하기
     * @method raddomBytes  버퍼라는 것을 반환함 버퍼는 1과 0을 의미, 배열과 비슷함
     * @method toString('hex')  버퍼 방식을 선호하지 않기 때문에 추출된 1과 0을 16진수의 문자열로 만들어준다.
     */
    const salt = randomBytes(8).toString('hex');

    /**
     * @description salt 가 붙은 비밀번호 값을 해시로 만들어주기
     * scrypt 를 호출하면 해시로 변환된 결과를 받게 된다.
     * 해시의 길이를 세번째 인자로 명시한다. 32 라고 했으니 32바이트를 반환한다 (32바이트 = 대략 44글자)
     * @Param Buffer - 타입스크립트는 scrypt 가 뭘 반환하는지 모르기 때문에 도와주기 위해서 넣은 부분
     */
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    /**
     * @description 위의 결과 두 개를 해시랑 소금을 하나로 만든다
     * @Parma + '.' - DB에 저장된 값을 slat.hash 로 만들기 위해서 넣음
     */
    const result = salt + '.' + hash.toString('hex');

    /**
     * @description 사용자 생성해서 저장하기
     *
     */
    const user = await this.userService.create(email, result);

    // 사용자 리턴하기
    return user;
  }

  async signin(email: string, password: string) {
    /**
     * 여러 사용자가 담긴 이메일 배열 목록을 반환하기 떄문에
     * @Param [user] - 를 통해서 이메일을 가진 사용자를 다 대상으로 하되
     * 여기에는 한 명의 사용자만 들어온다고 가정 하는 것
     */
    const [user] = await this.userService.find(email);

    if (!user) {
      throw new NotFoundException('없는 사용자 입니다');
    }

    /**
     * @description salt , hash 를 . 를 기준으로 분리
     * @Param split - 분리하는 메서드
     * 이 코드는 user.password 를 가지고 split 를 한다 마침표를 기준으로
     */
    const [salt, storedHash] = user.password.split('.');

    /**
     * @description 비밀번호 비교 작업
     * @Param hash - hash 를 16진수로 변환한 다음 그 값이 storedHash 랑 같은지 비교함
     * 그 후 비교를 했을 때 비밀번호가 같지 않다면 BadRequestException 반환
     * 같으면 User 반환
     */
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('비밀번호가 틀렸습니다');
    }
    return user;
  }
}
