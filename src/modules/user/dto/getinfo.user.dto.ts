import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserGetInfoDto {
  @ApiProperty({ example: '1', description: '用户ID' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  id: number;
}
