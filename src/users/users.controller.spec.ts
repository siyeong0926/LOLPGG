import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  /**@description 가짜 사본 생성
   *
   * @this Partial<UsersService> UserService 안의 메서드를 선택적으로 사용해서 가짜 사본 생성
   * @this Partial<AuthService> 위와 같음 이하 생략
   * 이렇게 Partial 로 지정하지 않으면 서비스 안의 메서드를 전부 작성 해둬야 하는 대참사 발생
   *
   */
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    /**
     * @description 가짜 정의 생성
     * @this fakeUserService={} 가짜 정의를 생성했음
     * 이렇게 위에서(describe) 두 서비스의 가짜 사본을 만들었고
     * 가짜 사본을 컨테이너(beforeEach)에 제공을 해주면 DI 컨테이너가
     * UsersController 의 인스턴스를 만들려고 할 때
     * 두 개의 가짜 사본을 사용하게 된다.
     *
     * 컨트롤러 안의 핸들러를 테스트 하려면
     * 각 서비스에 맞게 구분을 해서 메서드를 구현 해야 함
     * 물론 모두 구현 할 필요는 없음, 내가 테스트 할 것만
     */
    fakeUserService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'asdf@asdf.com',
          password: 'asdf',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'asdf' } as User]);
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      // signup: () => {},
      // signin: () => {},
    };

    const module: TestingModule = await Test.createTestingModule({
      /**
       * @this controller:[UsersController] 테스트 대상을 뜻함 이 컨트롤러가 테스트 중에 사용 될 수 있게 함
       * @this providers providers 배열은 테스트 환경에서 사용되는 서비스와 프로바이더를 정의 함
       * @this provide 실제 클래스를 의미하고
       * @this useValue 실제 클래스를 대체할 가짜 값을 지정함
       *
       */
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('주어진 ID를 가진 사용자를 찾지 못하면 findUser는 오류를 발생시킵니다', async () => {
    fakeUserService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });
});
