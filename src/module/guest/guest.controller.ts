import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from '@/entities';
import { GuestService } from './guest.service';
import { SignInDto, VerifyEmailResponseDto, SignUpDto, VerifyEmailDto } from './dto';

@ApiTags('Guest')
@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sign up',
    description: 'Creates a new user account. Email must be unique; password is encrypted before storage.',
  })
  @ApiResponse({ status: 201, description: 'Account created.', type: UserEntity })
  @ApiResponse({ status: 409, description: 'Email already registered.' })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.guestService.signUp(signUpDto);
  }

  @Post('sign-in')
  @ApiOperation({
    summary: 'Sign in',
    description:
      'Logs in with email and password. On success, also emails a verification OTP to confirm the address.',
  })
  @ApiResponse({ status: 200, description: 'Logged in; OTP sent.', type: VerifyEmailResponseDto })
  @ApiResponse({ status: 401, description: 'Email not found or password incorrect.' })
  signIn(@Body() signInDto: SignInDto) {
    return this.guestService.signIn(signInDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email with OTP',
    description: 'Verifies the user email using the 6-digit OTP sent at sign-in.',
  })
  @ApiResponse({ status: 200, description: 'Account verified.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
  @ApiResponse({ status: 409, description: 'Account already verified.' })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.guestService.verifyEmail(verifyEmailDto);
  }
}