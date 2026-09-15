import { UserEntity, UserVerificationEntity } from '@/entities';
import { MailService } from '@/shared/services/mail.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserVerificationEntity])],
  controllers: [GuestController],
  providers: [GuestService, MailService],
  exports: [GuestService],
})
export class GuestModule {}
