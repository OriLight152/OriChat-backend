import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserLoginDto } from './dto/login.user.dto';
import { UserRegisterDto } from './dto/register.user.dto';
import { UserGetInfoDto } from './dto/getinfo.user.dto';
import { UserService } from './user.service';
import { UserUpdateDto } from './dto/update.user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userSevice: UserService) {}

  @Post('/register')
  register(@Body() params: UserRegisterDto) {
    return this.userSevice.register(params);
  }

  @Post('/login')
  login(@Body() params: UserLoginDto) {
    return this.userSevice.login(params);
  }

  @Post('/verify')
  verify(@Body() params) {
    return this.userSevice.verify(params);
  }

  @Get('/info')
  getInfo(@Query() params: UserGetInfoDto) {
    return this.userSevice.getInfo(params);
  }

  @Post('/update')
  update(@Body() params: UserUpdateDto) {
    return this.userSevice.update(params);
  }
}
