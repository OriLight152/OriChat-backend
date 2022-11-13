import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserUpdateDto {
  @IsNotEmpty({ message: 'invalid token' })
  token: string;

  @ApiProperty({ example: 'nickname', description: '昵称' })
  @IsNotEmpty({ message: '昵称不能为空' })
  @MinLength(2, { message: '昵称长度最少为2位' })
  @MaxLength(12, { message: '昵称长度最多为12位' })
  nickname: string;

  @ApiProperty({ example: 'example@qq.com', description: '邮箱' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式错误' })
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

  @ApiProperty({
    example:
      'https://cravatar.cn/avatar/1762718020b76ef1d96d10c00761d2d0?size=100',
    description: '头像',
  })
  @IsNotEmpty({ message: '头像不能为空' })
  @MaxLength(200, { message: '头像长度最多为200位' })
  @IsUrl({}, { message: '头像格式错误' })
  avatar: string;

  @ApiProperty({
    example: '系统原装签名，送给每一位小可爱。',
    description: '签名',
  })
  @IsNotEmpty({ message: '签名不能为空' })
  @MaxLength(100, { message: '签名长度最多为100位' })
  sign: string;
}
