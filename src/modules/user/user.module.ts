import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { expiresIn, secret } from 'src/config/jwt';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    PrismaModule,
    JwtModule.register({
      secret,
      signOptions: { expiresIn },
    }),
  ],
})
export class UserModule {}
