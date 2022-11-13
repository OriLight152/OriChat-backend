import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserLoginDto } from './dto/login.user.dto';
import { UserRegisterDto } from './dto/register.user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserGetInfoDto } from './dto/getinfo.user.dto';
import { verifyToken } from 'src/utils/verify';
import { UserUpdateDto } from './dto/update.user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(params: UserRegisterDto) {
    const { username, nickname, password, email, sex } = params;
    if (!sex) {
      params.sex = 1;
    }
    const exist_username = await this.prisma.user.findUnique({
      where: {
        name: username,
      },
    });
    if (exist_username) {
      throw new HttpException(`该用户名已存在`, HttpStatus.BAD_REQUEST);
    }
    const exist_email = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (exist_email) {
      throw new HttpException(`该邮箱已存在`, HttpStatus.BAD_REQUEST);
    }
    await this.prisma.user.create({
      data: {
        name: username,
        nickname: nickname,
        password: password,
        email: email,
        sex: sex,
      },
    });
    return true;
  }

  async login(params: UserLoginDto) {
    const { username, password } = params;
    const exist_username = await this.prisma.user.findUnique({
      where: {
        name: username,
      },
    });
    if (!exist_username) {
      throw new HttpException(`该用户不存在`, HttpStatus.BAD_REQUEST);
    }
    if (exist_username.status != 0) {
      throw new HttpException(`该用户已被限制登录`, HttpStatus.BAD_REQUEST);
    }
    if (password != exist_username.password) {
      throw new HttpException(`密码错误`, HttpStatus.BAD_REQUEST);
    } else {
      const { id, name, nickname, email, role } = exist_username;
      return {
        id: id,
        name: name,
        role: role,
        token: this.jwtService.sign({
          id,
          name,
          nickname,
          email,
          role,
        }),
      };
    }
  }

  async verify(params) {
    const { token } = params;
    if (!token) {
      throw new HttpException(`invaild token`, HttpStatus.BAD_REQUEST);
    }
    const payload = await verifyToken(token);
    const { id } = payload;
    if (id === -1) {
      throw new HttpException(`invaild token`, HttpStatus.BAD_REQUEST);
    }
    return {
      id: id,
    };
  }

  async getInfo(params: UserGetInfoDto) {
    const { id: id } = params;
    const info = await this.prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        name: true,
        email: true,
        nickname: true,
        sex: true,
        status: true,
        avatar: true,
        sign: true,
      },
    });
    if (!info) {
      throw new HttpException(`该用户不存在`, HttpStatus.BAD_REQUEST);
    }
    return { info: Object.assign({ id: id }, info) };
  }

  async update(params: UserUpdateDto) {
    const { token, nickname, email, sex, avatar, sign } = params;
    const payload = await verifyToken(token);
    const { id } = payload;
    if (id === -1) {
      throw new HttpException(`invaild token`, HttpStatus.BAD_REQUEST);
    }

    const u = await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        nickname: nickname,
        email: email,
        sex: sex,
        avatar: avatar,
        sign: sign,
      },
    });

    return { ...u };
  }
}
