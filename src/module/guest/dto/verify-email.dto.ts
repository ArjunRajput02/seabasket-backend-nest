import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { SignUpResponseDto } from './sign-up.dto';

export class VerifyEmailRequestDto {
  @ApiProperty({ example: 'arjun.rajput@seaflux.tech' })
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : String(value),
  )
  email: string;

  @ApiProperty({ example: '530121' })
  @IsString()
  @Length(6, 6)
  otp: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty({ example: 'you have been logged in successfully' })
  message: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: SignUpResponseDto })
  user: SignUpResponseDto;
}
