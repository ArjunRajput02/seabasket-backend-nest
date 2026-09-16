import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpRequestDto {
  @ApiProperty({ example: 'jane@gmail.com' })
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

export class VerifyOtpResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
  };
}
