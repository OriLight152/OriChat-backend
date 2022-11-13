import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [PrismaModule, UserModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
