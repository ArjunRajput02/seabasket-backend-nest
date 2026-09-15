import { PasswordResetTokenEntity, UserEntity, UserVerificationEntity } from "@/entities";
import { encode, hashPassword, verifyHash } from "@/shared/helper";
import {
  EMAIL_VERIFICATION_CODE_EXPIRY_MINUTES,
  PASSWORD_RESET_TOKEN_EXPIRY_MINUTES,
} from "@/shared/constant";
import { MailService } from "@/shared/services/mail.service";
import { renderEmailTemplate } from "@/templates/template.util";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash, randomBytes, randomInt } from "crypto";
import { Repository } from "typeorm";
import {
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
} from "./dto";

@Injectable()
export class GuestService {
  private readonly logger = new Logger(GuestService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserVerificationEntity)
    private readonly userVerificationRepository: Repository<UserVerificationEntity>,

    @InjectRepository(PasswordResetTokenEntity)
    private readonly passwordResetTokenRepository: Repository<PasswordResetTokenEntity>,

    private readonly mailService: MailService,
  ) {}

  // this method handles the sign-up process for a new user.
  // saves the new user to the database
  async signUp(signUpDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    const { name, email, phone, password } = signUpDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        this.logger.warn('An account with this email already exists', { email });

        throw new ConflictException('An account with this email already exists');
      }

      if (existingUser.phone === phone) {
        this.logger.warn('An account with this phone number already exists', {
          phone,
        });

        throw new ConflictException('An account with this phone number already exists');
      }
    }
    // It checks if the email already exists, hashes the password,
    const hashedPassword = await hashPassword(password);

    // Creates a new user entity
    const newUser = this.userRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    const user = await this.userRepository.save(newUser); // saves the new user to the database
    await this.sendVerificationOtp(user); // sends a verification OTP to the user's email.

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
  }

  // this method handles the sign-in process for an existing user.
  async signIn(signInDto: SignInRequestDto): Promise<SignInResponseDto> {
    const { email, password } = signInDto;

    // It checks if the user exists in the database
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      this.logger.error('No account found with this email', { email });
      throw new UnauthorizedException('No account found with this email');
    }

    // It verifies the provided password against the stored hashed password
    const isPasswordValid = await verifyHash(password, user.password);

    if (!isPasswordValid) {
      this.logger.error('Incorrect password', { email });
      throw new UnauthorizedException('Incorrect password');
    }

    // If the password is valid, it generates a new OTP, saves it in the database.
    await this.sendVerificationOtp(user);

    return {
      message: 'We have sent you an OTP to verify account',
      email: user.email,
    };
  }

  // this method handles the email verification process using the OTP sent to the user's email.
  async verifyEmail(verifyEmailDto: VerifyEmailRequestDto): Promise<VerifyEmailResponseDto> {
    const { email, otp } = verifyEmailDto;

    // It checks if the user exists in the database
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
      message: 'you have been logged in successfully',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  // this method handles the forgot password process.
  async forgotPassword(forgotPasswordDto: ForgotPasswordRequestDto,): Promise<ForgotPasswordResponseDto> {
    const { email } = forgotPasswordDto;

    const genericMessage ="We have sent a reset password link to your email";

    // It checks if the user exists in the database
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      this.logger.error('Please Enter the correct email', {email});
      throw new BadRequestException('Please Enter the correct email')
    }

    const rawToken = randomBytes(32).toString("hex");// generates a secure random token for password reset
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");// hashes the token using SHA-256 for secure storage in the database
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,); // sets an expiration time for the token

    // It deletes any existing password reset tokens for the user to ensure only one valid token exists at a time
    await this.passwordResetTokenRepository.delete({ userId: user.id }); 

    // It creates a new password reset token entity and saves it to the database
    const newResetToken = this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.passwordResetTokenRepository.save(newResetToken);// saves the new password reset token to the database

    // It constructs a password reset link that includes the raw token as a query parameter
    const resetLink = `${process.env.FRONTEND_RESET_PASSWORD_PATH ?? "/reset-password"}?token=${rawToken}`;

    // It renders an email template for the password reset email, including the user's name and the reset link
    const { subject, html } = renderEmailTemplate("forgot-password", {
      name: user.name,
      resetLink,
    });

    // sends the password reset email to the user's email address
    await this.mailService.sendEmail({ to: user.email, subject, html });

    return { message: genericMessage };
  }

 // this method handles the password reset process using the token from the reset password link.
 async resetPassword( token: string,resetPasswordDto: ResetPasswordRequestDto,): Promise<ResetPasswordResponseDto> {
    const { newPassword } = resetPasswordDto;

    const tokenHash = createHash("sha256").update(token).digest("hex");// hashes the provided token using SHA-256 for secure comparison with the stored hashed token in the database

    // It checks if the hashed token exists in the database and retrieves the corresponding password reset token entity
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { tokenHash },
    });

    // If the token is invalid or expired, it throws a BadRequestException with an appropriate error message
    if (!resetToken) {
      this.logger.error("Invalid or expired reset link");
      throw new BadRequestException("Invalid or expired reset link");
    }

    // It checks if the token has expired by comparing the expiration time with the current time
    if (resetToken.expiresAt.getTime() < Date.now()) {
      this.logger.error('Invalid or expired reset link:', {userId: resetToken.userId});
      await this.passwordResetTokenRepository.delete({ id: resetToken.id });
      throw new BadRequestException("Invalid or expired reset link");
    }

    const hashedPassword = await hashPassword(newPassword);// hashes the new password

    // It updates the user's password in the database with the newly hashed password
    await this.userRepository.update(
      { id: resetToken.userId },
      { password: hashedPassword },
    );
    await this.passwordResetTokenRepository.delete({ id: resetToken.id }); // deletes the used password reset token from the database

    return { message: "Your password has been reset successfully" };
  }

  // this method generates a 6-digit OTP
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