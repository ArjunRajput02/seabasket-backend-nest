import { UserEntity, UserVerificationEntity } from "@/entities";
import { encode, hashPassword, verifyHash } from "@/shared/helper";
import { EMAIL_VERIFICATION_CODE_EXPIRY_MINUTES } from "@/shared/constant";
import { MailService } from "@/shared/services/mail.service";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomInt } from "crypto";
import { Repository } from "typeorm";
import {
  SignInDto,
  SignInResponseDto,
  VerifyEmailResponseDto,
  SignUpDto,
  VerifyEmailDto,
} from "./dto";

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(UserVerificationEntity)
    private readonly userVerificationRepository: Repository<UserVerificationEntity>,

    private readonly mailService: MailService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: signUpDto.email },
    });

    if (existingUser) {
      throw new ConflictException("An account with this email already exists");
    }

    const hashedPassword = await hashPassword(signUpDto.password);

    const user = await this.userRepository.save(
      this.userRepository.create({
        name: signUpDto.name,
        email: signUpDto.email,
        phone: signUpDto.phone,
        password: hashedPassword,
      }),
    );
    await this.sendVerificationOtp(user);

    return user;
  }

  async signIn(signInDto: SignInDto): Promise<SignInResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
    });

    if (!user) {
      throw new UnauthorizedException("No account found with this email");
    }

    const isPasswordValid = await verifyHash(signInDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Incorrect password");
    }

    await this.sendVerificationOtp(user);

    return {
      message: "We have sent you an OTP to verify account",
      email: user.email,
    };
  }

  async verifyEmail( verifyEmailDto: VerifyEmailDto,): Promise<VerifyEmailResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: verifyEmailDto.email },
    });

    if (!user) {
      throw new BadRequestException("Invalid OTP");
    }

    const verification = await this.userVerificationRepository.findOne({
      where: { userId: user.id, token: verifyEmailDto.otp },
      order: { createdAt: "DESC" },
    });

    if (!verification) {
      throw new BadRequestException("Invalid OTP");
    }

    if (verification.verifiedAt) {
      throw new ConflictException("This account is already verified");
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException("OTP has expired");
    }

    verification.verifiedAt = new Date();
    await this.userVerificationRepository.save(verification);

    return {
      message: "you have been logged in successfully",
      accessToken: encode({
        sub: user.id,
        email: user.email,
      }),
      user,
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

    await this.userVerificationRepository.save(
      this.userVerificationRepository.create({
        userId: user.id,
        token: otp,
        expiresAt,
      }),
    );

    await this.mailService.sendVerificationEmail(user.email, otp);
  }
}
