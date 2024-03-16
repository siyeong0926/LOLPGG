import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Render,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { Response } from 'express';
import { LolService } from '../search/lol.service';

/**
 * @description 데코레이터
 * @Controller
 * 'auth' 경로를 처리하는 컨트롤러를 정의합니다.
 * 이 컨트롤러에서 정의된 모든 라우트는 '/auth'로 시작하는 URL 경로를 가지게 됩니다.
 *
 * @Serialize(UserDto)
 * 이 컨트롤러의 모든 응답을 UserDto 형식으로 직렬화합니다.
 * UserDto는 사용자 데이터를 안전하게 전송하기 위해 정의된 데이터 전송 객체(DTO)입니다.
 *
 * @UseInterceptors(CurrentUserInterceptor)
 * 이 컨트롤러의 모든 요청에 CurrentUserInterceptor를 적용합니다.
 * CurrentUserInterceptor는 현재 사용자 정보를 요청 객체에 추가하는 역할을 합니다.
 * UserController 에 어떤 요청이 오던지 이 인터셉터가 먼저 실행되고
 * session 객체에서 사용자 아이디를 조회 후 DB에서 사용자 정보를 찾아
 * request 객체에 저장함
 * 지금은 APP_INTERCEPTOR 방법으로 대체했음 나중에 필요 하면 사용
 */
@Controller('/lolp.gg/user')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private lolService: LolService,
  ) {}

  // @Get('/whoami')
  // whoAmI(@Session() session: any) {
  //   return this.usersService.findOne(session.userId);
  // }

  /**
   * @param user @CurrentUser() 데코레이터를 통해
   * 현재 사용자 정보를 취득해서 user 에 담음
   */

  @Get('/profile')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Post('/logout')
  signOut(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.status(200).send({ message: '로그아웃 되었습니다.' });
  }

  @Get('/signup')
  @Render('signup')
  showsignup() {
    return;
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Res() res: Response) {
    try {
      await this.authService.signup(body.email, body.password);

      return res.redirect('/lolp.gg/login');
    } catch (error) {
      return res
        .status(400)
        .send({ message: '회원가입 실패', error: error.message });
    }
  }

  //----------------------------------

  @Get('/login')
  @Render('login')
  showLogin() {
    return { message: '로그인 페이지' };
  }

  /**
   *
   * @param CreateUserDto - 를 사용하는 이유는
   * 로그인과는 적합하지 않은 이름이지만 email , password 를 검증 하기에는 충분해서
   */

  @Post('/login')
  async login(@Body() body: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.authService.login(body.email, body.password);

      if (user) {
        res.json({ access_token: user });
      } else {
        res.status(401).json({ message: '승인 되지 않음' });
      }

      return user;
    } catch (error) {
      console.error('로그인 에러 발생함', error.message);
      throw new UnauthorizedException(' 로그인 실패 ', error.message);
    }
  }
  //----------------------------------

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('유저를 못찾았음');
    }
    return user;
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @Patch('/:id')
  uadateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }
}
