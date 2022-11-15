import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { verifyToken } from 'src/utils/verify';
import { RoomCreateDto } from './dto/room.create.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createRoom(params: RoomCreateDto) {
    const { ownerId, title, needPassword, password } = params;
    const exist_owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });
    if (!exist_owner) {
      throw new HttpException(`创建人不存在`, HttpStatus.BAD_REQUEST);
    }
    await this.prisma.room.create({
      data: {
        ownerId: exist_owner.id,
        title: title,
        needPassword: Number(needPassword),
        password: password,
        members: '{}',
      },
    });
    return true;
  }

  async getRoomHistory(params) {
    const { token, room_id } = params;
    if (!token) {
      throw new HttpException(`invalid token`, HttpStatus.BAD_REQUEST);
    }
    if (!room_id && room_id != 0) {
      throw new HttpException(`invalid request`, HttpStatus.BAD_REQUEST);
    }
    const payload = await verifyToken(token);
    const { id } = payload;
    if (id === -1) {
      throw new HttpException(`invalid token`, HttpStatus.BAD_REQUEST);
    }
    const h = await this.prisma.message.findMany({
      where: {
        roomId: room_id,
        // status: 0,
      },
      select: {
        id: true,
        type: true,
        senderId: true,
        text: true,
        quoteMessageId: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            nickname: true,
            avatar: true,
          },
        },
      },
      take: -50,
    });
    (await h).forEach((ele) => {
      if (ele.status === 1) {
        ele.quoteMessageId = -1;
        ele.senderId = 1;
        ele.text = '该信息已被撤回';
      } else if (ele.status === 2) {
        ele.quoteMessageId = -1;
        ele.senderId = 1;
        ele.text = '该信息内容违规';
      }
    });
    return { room_id, history: h };
  }

  async getRoomInfo(params) {
    const { id } = params;
    const r = await this.prisma.room.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        ownerId: true,
        title: true,
        introduction: true,
        notice: true,
        status: true,
        needPassword: true,
      },
    });
    if (!r) {
      throw new HttpException(`房间不存在`, HttpStatus.BAD_REQUEST);
    } else {
      return { ...r };
    }
  }
}
