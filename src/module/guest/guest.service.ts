import { UserEntity, UserVerificationEntity } from '@/entities';
import { EMAIL_VERIFICATION_CODE_EXPIRY_MINUTES } from '@/shared/constant';
import { encode, hashPassword, verifyHash } from '@/shared/helper';
import { MailService } from '@/shared/services/mail.service';
import { renderEmailTemplate } from '@/templates/template.util';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import {
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
} from './dto';

@Injectable()
export class GuestService {
  private readonly logger = new Logger(GuestService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserVerificationEntity)
    private readonly userVerificationRepository: Repository<UserVerificationEntity>,

    private readonly mailService: MailService,
  ) {}

  // this method handles the sign-up process for a new user.
  // saves the new user to the database
  async signUp(SignUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    const { name, email, phone, password } = SignUpRequestDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      const { email: existingEmail, phone: existingPhone } = existingUser;

      if (existingEmail === email) {
        this.logger.error('An account with this email already exists', { email });
        throw new ConflictException('An account with this email already exists');
      }

      if (existingPhone === phone) {
        this.logger.error('An account with this phone already exists', { phone });
        throw new ConflictException('An account with this phone already exists');
      }
    }

    // It checks if the email already exists, hashes the password.
    const hashedPassword = await hashPassword(password);

    // Creates a new user entity.
    const newUser = this.userRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // Saves the new user to the database.
    const user = await this.userRepository.save(newUser);

    // Sends a verification OTP to the user's email.
    await this.sendVerificationOtp(user);

    return {
      message: 'User registered successfully. We have sent a verification OTP to your email.',
    };
  }

  // This method handles the sign-in process for an existing user.
  async signIn(SignInRequestDto: SignInRequestDto): Promise<SignInResponseDto> {
    const { email, password } = SignInRequestDto;

    // It checks if the user exists in the database.
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      this.logger.error('No account found with this email', { email });
      throw new UnauthorizedException('No account found with this email');
    }

    // It verifies the provided password against the stored hashed password.
    const isPasswordValid = await verifyHash(password, user.password);

    if (!isPasswordValid) {
      this.logger.error('Incorrect password', { email });
      throw new UnauthorizedException('Incorrect password');
    }

    // If the password is valid, it generates a new OTP and saves it in the database.
    await this.sendVerificationOtp(user);

    return {
      message: 'We have sent you an OTP to verify account',
      email: user.email,
    };
  }

  // This method handles the email verification process using the OTP sent to the user's email.
  async verifyOtp(VerifyOtpRequestDto: VerifyOtpRequestDto): Promise<VerifyOtpResponseDto> {
    const { email, otp } = VerifyOtpRequestDto;

    // It checks if the user exists in the database.
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      this.logger.error('No account found with this email', { email });
      throw new BadRequestException('No account found with this email');
    }

    const verification = await this.userVerificationRepository.findOne({
      where: { userId: user.id, token: otp },
      order: { createdAt: 'DESC' },
    });

    if (!verification) {
      this.logger.error('Invalid OTP', { email });
      throw new BadRequestException('Invalid OTP');
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      this.logger.error('OTP has expired', { email });
      await this.userVerificationRepository.delete({ id: verification.id });
      throw new BadRequestException('OTP has expired');
    }

    await this.userVerificationRepository.delete({ id: verification.id });

    // If the OTP is valid and not expired, it generates an access token for the user.
    const accessToken = encode({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'You have been logged in successfully',
      accessToken,
      user: {
        id: user.id,
      },
    };
  }

  // This method generates a 6-digit OTP
  // saves it in the database with an expiration time
  // sends it to the user's email.
  private async sendVerificationOtp(user: UserEntity): Promise<void> {
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);

    await this.userVerificationRepository.delete({ userId: user.id });

    const newVerification = this.userVerificationRepository.create({
      userId: user.id,
      token: otp,
      expiresAt,
    });

    await this.userVerificationRepository.save(newVerification);

    const { subject, html } = renderEmailTemplate('verify-otp', {
      name: user.name,
      otp,
    });

    await this.mailService.sendEmail({ to: user.email, subject, html });
  }
}
