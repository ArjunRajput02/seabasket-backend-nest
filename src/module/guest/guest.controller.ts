import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuestService } from './guest.service';
import {
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
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
  signUp(@Body() SignUpRequestDto: SignUpRequestDto) {
    return this.guestService.signUp(SignUpRequestDto);
  }

  @Post('sign-in')
  @ApiOperation({
    summary: 'Sign in',
    description:
      'Logs in with email and password. On success, also emails a verification OTP to confirm the address.',
  })
  @ApiResponse({ status: 200, description: 'Logged in; OTP sent.', type: SignInResponseDto })
  @ApiResponse({ status: 401, description: 'Email not found or password incorrect.' })
  signIn(@Body() signInRequestDto: SignInRequestDto) {
    return this.guestService.signIn(signInRequestDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email with OTP',
    description: 'Verifies the user email using the 6-digit OTP sent at sign-in.',
  })
  @ApiResponse({ status: 200, description: 'Account verified.', type: VerifyOtpResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
  verifyOtp(@Body() VerifyOtpRequestDto: VerifyOtpRequestDto) {
    return this.guestService.verifyOtp(VerifyOtpRequestDto);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Emails a password reset link if an account exists for the given email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructions sent (if the account exists).',
    type: ForgotPasswordResponseDto,
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordRequestDto) {
    return this.guestService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Sets a new password using the token from the reset password link, passed as a header.',
  })
  @ApiHeader({
    name: 'x-reset-token',
    description: 'Token from the reset password link',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Password reset.', type: ResetPasswordResponseDto })
  @ApiResponse({ status: 400, description: 'Missing, invalid, or expired reset token.' })
  resetPassword(
    @Headers('x-reset-token') token: string,
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ) {
    if (!token) {
      throw new BadRequestException('x-reset-token header is required');
    }

    return this.guestService.resetPassword(token, resetPasswordDto);
  }
}
