import { UserEntity, UserVerificationEntity } from "@/entities";
import { encode, hashPassword, verifyHash } from "@/shared/helper";
import { EMAIL_VERIFICATION_CODE_EXPIRY_MINUTES } from "@/shared/constant";
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
import { randomInt } from "crypto";
import { Repository } from "typeorm";
import {
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

    private readonly mailService: MailService,
  ) {}

  async signUp(signUpDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    const { name, email, phone, password } = signUpDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`Sign up failed - email already exists: ${email}`);
      throw new ConflictException("An account with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = this.userRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    const user = await this.userRepository.save(newUser);

    await this.sendVerificationOtp(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
  }

  async signIn(signInDto: SignInRequestDto): Promise<SignInResponseDto> {
    const { email, password } = signInDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      this.logger.error("No account found with this email", { email });
      throw new UnauthorizedException("No account found with this email");
    }

    const isPasswordValid = await verifyHash(password, user.password);

    if (!isPasswordValid) {
      this.logger.error("Incorrect password", { email });
      throw new UnauthorizedException("Incorrect password");
    }

    await this.sendVerificationOtp(user);

    return {
      message: "We have sent you an OTP to verify account",
      email: user.email,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailRequestDto): Promise<VerifyEmailResponseDto> {
    const { email, otp } = verifyEmailDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      this.logger.error("No account found with this email", { email });
      throw new BadRequestException("No account found with this email");
    }

    const verification = await this.userVerificationRepository.findOne({
      where: { userId: user.id, token: otp },
      order: { createdAt: "DESC" },
    });

    if (!verification) {
      this.logger.error("Invalid OTP", { email });
      throw new BadRequestException("Invalid OTP");
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      this.logger.error("OTP has expired", { email });
      await this.userVerificationRepository.delete({ id: verification.id });
      throw new BadRequestException("OTP has expired");
    }

    await this.userVerificationRepository.delete({ id: verification.id });

    const accessToken = encode({
      sub: user.id,
      email: user.email,
    });

    return {
      message: "you have been logged in successfully",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  // this method generates a 6-digit OTP
  // saves it in the database with an expiration time
  // sends it to the user's email.
  private async sendVerificationOtp(user: UserEntity): Promise<void> {
    const otp = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000,
    );

    await this.userVerificationRepository.delete({ userId: user.id });

    const newVerification = this.userVerificationRepository.create({
      userId: user.id,
      token: otp,
      expiresAt,
    });
    await this.userVerificationRepository.save(newVerification);

    const { subject, html } = renderEmailTemplate("verify-otp", {
      name: user.name,
      otp,
    });

    await this.mailService.sendEmail({ to: user.email, subject, html });
  }
}