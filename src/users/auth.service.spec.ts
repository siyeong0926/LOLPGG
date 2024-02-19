import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService 테스트', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    /**
     * @description 가짜 사용자 서비스 객체 만들기
     * @method find 실제 UserService 의 find 메서드의 동작을 흉내내는 가짜 메서드
     * @method create 실제 UserService 의 create 메서드의 동작을 흉내내는 가짜 메서드
     * @param Partial<UsersService> UserService 의 모든 메서드 선택적으로 가질 수 있는 타입
     * -> 덧붙여 설명 하자면, UserService 에 메서드가 10개면 내가 5개만 가져다 사용 하더라도
     * -> Partial 를 사용 하면 타입 스크립트는 정의된 5개만 확인을 함
     *
     * @param User[] 가짜 데이터를 저장하기 위한 빈 배열을 생성하는 부분
     *
     * @param Promise.resolve([]) - [] 를 반환하는 이유는 실제 find 메서드 동작을 흉내내기 위함인데
     * -> 실제 find 는 DB에 접근해서 사용자 목록을 반환 하는데
     * -> 바로 빈 배열을 반환 하므로 사용자 목록을 반환하는 동작을 흉내 내는 것이다
     * 지금은 find 메서드 부분을 업그레이드 해서 지워진 상태임
     */
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((users) => users.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    /**
     * @description 테스트 모듈 만들기 feat.UserService 의 실제 의존성을 가짜 객체로 재정의하기
     * @param provide 누군가 이를 요청 할 경우
     * @param useValue 이 값을 제공 한다는 뜻
     * 즉 정리하면 UserService 를 요청하면 fakeUsersService 를 제공 하는 셈
     */
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();
    //서비스 인스턴스 받기
    service = module.get<AuthService>(AuthService);
  });

  it('인증 서비스의 인스턴스를 생성 할 수 있다', async () => {
    expect(service).toBeDefined();
  });

  it('솔트, 해시 조합을 갖춘 비밀번호를 가진 새 사용자 생성', async () => {
    // 'signup' 메서드를 호출하여 새 사용자를 생성하고, 그 결과를 'user' 변수에 저장합니다.
    const user = await service.signup('asdf@asdf.com', 'asdf');

    // 생성된 사용자의 비밀번호가 원래 입력한 비밀번호('asdf')와 다른지 확인합니다.
    // 즉, 비밀번호가 제대로 솔트와 해시를 거쳐 변환되었는지를 검증합니다.
    expect(user.password).not.toEqual('asdf');

    // 생성된 사용자의 비밀번호를 '.' 기준으로 분리하여 'salt' 와 'hash' 변수에 각각 저장합니다.
    const [salt, hash] = user.password.split('.');

    // 'salt'와 'hash'가 모두 정의되어 있는지 확인합니다.
    // 즉, 비밀번호가 제대로 솔트와 해시를 포함하고 있는지를 검증합니다.
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  /**
   * @description 중복 이메일 걸러내기
   * @param rejects 이 함수가 문제를 일으킬 것이다 라는 의미
   * @param toThrow 이 함수가 특정한 오류를 일으킬 것이다 ( 특정한 오류 : 우리가 미리 정해놓은 오류를 의미 )
   * 즉 rejects.toThrow(BadRequestException) 는 실패할 것을 예상할 때 사용함
   */
  it('이미 사용중인 이메일로 사용자가 가입 하면 오류 발생 시키기', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('가입되지 않은 이메일로 로그인 할 때 예외 발생', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('잘못된 비밀번호 입력시 예외 발생', async () => {
    await service.signup('laskdjf@alskdfj.com', 'password');
    await expect(
      service.signin('laskdjf@alskdfj.com', 'laksdlfkj'),
    ).rejects.toThrow(BadRequestException);
  });

  it('비밀번호가 올바르면 사용자 반환', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');
    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
