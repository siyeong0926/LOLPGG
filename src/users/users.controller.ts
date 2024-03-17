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

@Controller('/lolp.gg/user')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private lolService: LolService,
  ) {}

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

      return res.redirect('/lolp.gg');
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
