import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({ example: 'Your password has been reset successfully' })
  message: string;
}