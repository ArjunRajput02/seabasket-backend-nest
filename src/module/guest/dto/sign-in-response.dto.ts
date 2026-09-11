import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty({example: 'We have sent you an OTP to verify account',})
  message: string;

  @ApiProperty({example: 'arjun@example.com',})
  email: string;
}