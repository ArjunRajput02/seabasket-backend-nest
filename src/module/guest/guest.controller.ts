import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuestService } from './guest.service';
import {
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
} from './dto';

@ApiTags('Guest')
@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED) // this is the default status code for POST requests
  @ApiOperation({
    summary: 'Sign up',
    description:
      'Creates a new user account. Email must be unique; password is encrypted before storage.',
  })
  @ApiResponse({ status: 201, description: 'Account created.', type: SignUpResponseDto })
  @ApiResponse({ status: 409, description: 'Email already registered.' })
  signUp(@Body() signUpDto: SignUpRequestDto) {
    return this.guestService.signUp(signUpDto);
  }

  @Post('sign-in')
  @ApiOperation({
    summary: 'Sign in',
    description:
      'Logs in with email and password. On success, also emails a verification OTP to confirm the address.',
  })
  @ApiResponse({ status: 200, description: 'Logged in; OTP sent.', type: SignInResponseDto })
  @ApiResponse({ status: 401, description: 'Email not found or password incorrect.' })
  signIn(@Body() signInDto: SignInRequestDto) {
    return this.guestService.signIn(signInDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email with OTP',
    description: 'Verifies the user email using the 6-digit OTP sent at sign-in.',
  })
  @ApiResponse({ status: 200, description: 'Account verified.', type: VerifyEmailResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailRequestDto) {
    return this.guestService.verifyEmail(verifyEmailDto);
  }
}
