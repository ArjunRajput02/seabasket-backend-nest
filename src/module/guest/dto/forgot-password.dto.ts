import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : String(value)))
  email: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({
    example: "We have sent a reset password link to your email",
  })
  message: string;
}