import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@/entities';

export class VerifyEmailResponseDto {
  @ApiProperty({ example: 'We have sent you an OTP to verify your email' })
  message: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserEntity })
  user: UserEntity;
}