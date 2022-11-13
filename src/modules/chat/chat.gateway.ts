import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PrismaClient } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { verifyToken } from 'src/utils/verify';

@WebSocketGateway(3002, {
  allowEIO3: true,
  cors: {
    origin: /.*/,
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private prisma: PrismaClient) {}

  private logger: Logger = new Logger('ChatGateway');
  @WebSocketServer() private socket: Server;

  private clientIdMap: any = {}; // client -> user 映射表
  private onlineUser: any = {}; // 在线用户列表
  private activeRoom: any = {}; // 活跃房间列表
  private systemAvatar = '';

  // 客户端事件 ————————————————————————————————————————————————————————————————————————————————————————————————

  async afterInit() {
    this.systemAvatar = (
      await this.prisma.user.findUnique({
        where: { id: 1 },
        select: { avatar: true },
      })
    ).avatar;
    this.activeRoom['1'] = { member: [] };
    this.activeRoom['2'] = { member: [] };
    this.logger.log('WebSocket init at ws://localhost:3002');
  }

  // 连接建立
  async handleConnection(client: Socket) {
    const query = client.handshake.query;
    this.logger.log('WebSocket client connect');
    const { token, room_id = '1' } = query;
    const payload = await verifyToken(token);
    const { id } = payload;
    // 校验token
    if (id === -1 || !token) {
      client.emit(
        'authFail',
        JSON.stringify({ code: -1, msg: '无效token，请重新登录' }),
      );
      this.logger.log('invalid token');
      return client.disconnect();
    }
    // 读取用户信息
    const u = await this.prisma.user.findUnique({ where: { id: id } });
    if (!u) {
      client.emit(
        'authFail',
        JSON.stringify({ code: -1, msg: '该用户不存在' }),
      );
      return client.disconnect();
    }
    const { name, nickname, sex, role, avatar, sign } = u;
    const userInfo = { id, name, nickname, sex, role, avatar, sign };

    // 将用户加入到列表
    this.onlineUser[client.id] = { userInfo, room_id };

    // 将用户加入到房间
    this.activeRoom[room_id as string].member.push(id);
    client.join(room_id);

    // 发送通知
    client.emit('info', '加入房间 ' + room_id);
    // await this.newSystemMessage(
    //   room_id as string,
    //   '[系统通知] ' + nickname + '(' + uid + ') 加入当前房间',
    // );
    await this.updateRoomMember(room_id as string);
    await this.updateRoomList(client);
    this.logger.log('user ' + id + ' online');
    this.logger.log('user ' + id + ' join room ' + room_id);
  }

  // 连接断开
  async handleDisconnect(client: Socket) {
    const clientInfo = this.onlineUser[client.id];
    if (!clientInfo) return;
    // 将用户从映射表中删除
    const { userInfo, room_id } = clientInfo;
    const { id } = userInfo;

    // 将用户从房间中移除
    const index = this.activeRoom[room_id].member.indexOf(id);
    this.activeRoom[room_id].member.splice(index, 1);

    delete this.onlineUser[client.id];

    // 发送通知
    // await this.newSystemMessage(
    //   room_id,
    //   '[系统通知] ' + userInfo.nickname + '(' + userInfo.id + ') 退出当前房间',
    // );
    await this.updateRoomMember(room_id as string);
    this.logger.log('user ' + id + ' offline');
  }

  @SubscribeMessage('sendMessage')
  async handleNewMessage(client: Socket, data: any) {
    const clientInfo = this.onlineUser[client.id];
    if (!clientInfo) return;

    const { text } = data;
    if (!text) return;

    const { userInfo, room_id } = clientInfo;
    const { id: uid, nickname, avatar } = userInfo;

    const m = await this.prisma.message.create({
      data: {
        roomId: Number(room_id),
        senderId: uid,
        text: text,
      },
    });

    this.socket
      .in(room_id)
      .emit('newMessage', JSON.stringify({ ...m, user: { nickname, avatar } }));
  }

  @SubscribeMessage('switchRoom')
  async handleSwitchRoom(client: Socket, data: any) {
    const clientInfo = this.onlineUser[client.id];
    if (!clientInfo) return;
    const { room_id: newRoom } = data;
    if (!newRoom) return;
    const newRoomExist = this.activeRoom[newRoom];
    if (!newRoomExist) {
      await this.sendNotification(
        client,
        'warning',
        '房间 ' + newRoom + ' 不存在',
      );
      return;
    }

    const { userInfo, room_id: oldRoom } = clientInfo;
    const { id } = userInfo;

    if (newRoom == oldRoom)
      return await this.sendNotification(client, 'warning', '你已在此房间内');

    // 加入新房间
    client.join(newRoom);
    this.onlineUser[client.id].room_id = newRoom;
    this.activeRoom[newRoom].member.push(id);

    // 从旧房间移除
    client.leave(oldRoom);
    const index = this.activeRoom[oldRoom].member.indexOf(id);
    this.activeRoom[oldRoom].member.splice(index, 1);

    // 发送结果
    await this.sendNotification(client, 'success', '加入房间 ' + newRoom);
    await client.emit('updateRoomInfo', newRoom);

    // 更新两个房间所有人的列表
    await this.updateRoomMember(newRoom);
    await this.updateRoomMember(oldRoom);
    this.logger.log('user ' + id + ' leave room ' + oldRoom);
    this.logger.log('user ' + id + ' join room ' + newRoom);

    // 发送通知
    // await this.newSystemMessage(
    //   newRoom,
    //   '[系统通知] ' + userInfo.nickname + '(' + userInfo.id + ') 加入当前房间',
    // );
    // await this.newSystemMessage(
    //   oldRoom,
    //   '[系统通知] ' + userInfo.nickname + '(' + userInfo.id + ') 退出当前房间',
    // );
  }

  // 方法 ————————————————————————————————————————————————————————————————————————————————————————————————

  async sendNotification(client: Socket, type, msg) {
    client.emit(type, String(msg));
  }

  async newMessage(room_id: string, userInfo: any, message: string) {
    const { id: uid, nickname, avatar } = userInfo;
    const m = await this.prisma.message.create({
      data: {
        roomId: Number(room_id),
        senderId: uid,
        text: message,
      },
    });
    this.socket
      .in(room_id)
      .emit('newMessage', JSON.stringify({ ...m, user: { nickname, avatar } }));
    this.logger.log('user ' + uid + ' send message at ' + room_id);
  }

  async newSystemMessage(room_id: string, message: string) {
    const sys = { id: 1, nickname: '系统', avatar: this.systemAvatar };
    await this.newMessage(room_id, sys, message);
  }

  async updateRoomList(client: Socket = undefined) {
    const rooms = Object.keys(this.activeRoom);
    if (!client) {
      for (const room in rooms) {
        this.socket.in(room).emit('updateRoomList', JSON.stringify(rooms));
      }
    } else {
      client.emit('updateRoomList', JSON.stringify(rooms));
    }
  }

  async updateRoomMember(room_id: string) {
    const members = [];
    Object.keys(this.onlineUser).forEach((client_id) => {
      const { userInfo: ui, room_id: ri } = this.onlineUser[client_id];
      if (ri === room_id) {
        const { id, nickname } = ui;
        members.push({ id, nickname });
      }
    });
    this.socket.in(room_id).emit('updateMemberList', JSON.stringify(members));
  }
}
