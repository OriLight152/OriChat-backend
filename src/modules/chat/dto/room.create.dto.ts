import { IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RoomCreateDto {
  @ApiProperty({ example: '1', description: '创建人ID' })
  @IsNotEmpty({ message: '创建人ID不能为空' })
  ownerId: number;

  @ApiProperty({ example: 'title', description: '房间标题' })
  @IsNotEmpty({ message: '标题不能为空' })
  @MinLength(5, { message: '标题长度最少为5位' })
  @MaxLength(20, { message: '标题长度最多为20位' })
  title: string;

  @ApiProperty({ example: '0', description: '房间公开属性' })
  @IsNotEmpty({ message: '房间公开属性不能为空' })
  needPassword: number;

  @ApiProperty({
    example: '123456',
    description: '房间密码',
    required: false,
  })
  @IsOptional()
  @MaxLength(30, { message: '房间密码长度最多为64位' })
  password: string;
}
