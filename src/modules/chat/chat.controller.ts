import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { RoomCreateDto } from './dto/room.create.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('/createRoom')
  createRoom(@Body() params: RoomCreateDto) {
    return this.chatService.createRoom(params);
  }

  @Post('/history')
  getRoomHistory(@Body() params) {
    return this.chatService.getRoomHistory(params);
  }

  @Get('/roomInfo')
  getRoomInfo(@Query() params) {
    return this.chatService.getRoomInfo(params);
  }
}
