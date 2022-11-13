import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserRegisterDto {
  @ApiProperty({ example: 'username', description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(5, { message: '用户名长度最少为5位' })
  @MaxLength(12, { message: '用户名长度最多为12位' })
  username: string;

  @ApiProperty({ example: 'nickname', description: '昵称' })
  @IsNotEmpty({ message: '昵称不能为空' })
  @MinLength(2, { message: '昵称长度最少为2位' })
  @MaxLength(12, { message: '昵称长度最多为12位' })
  nickname: string;

  @ApiProperty({ example: '123456', description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度最少为6位' })
  @MaxLength(36, { message: '密码长度最多为36位' })
  password: string;

  @ApiProperty({ example: 'example@qq.com', description: '邮箱' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请填写正确格式的邮箱' })
  @MaxLength(64, { message: '邮箱长度最多为64位' })
  email: string;

  @ApiProperty({
    example: 1,
    description: '性别',
    required: false,
    enum: [1, 2, 3],
  })
  @IsOptional()
  @IsEnum([1, 2, 3], { message: '性别只能是1、2、3' })
  @Type(() => Number)
  sex: number;
}
