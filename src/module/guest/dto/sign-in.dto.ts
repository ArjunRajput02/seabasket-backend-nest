import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class SignInRequestDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : String(value),
  )
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class SignInResponseDto {
  @ApiProperty({ example: 'We have sent you an OTP to verify account' })
  message: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;
}
