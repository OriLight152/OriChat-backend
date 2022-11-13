import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, PrismaClient],
  imports: [PrismaModule],
})
export class ChatModule {}
