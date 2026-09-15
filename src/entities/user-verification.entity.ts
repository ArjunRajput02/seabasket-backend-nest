import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

@Index(['userId', 'token'])
@Entity({ name: 'user_verifications' })
export class UserVerificationEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  @ApiProperty()
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  @ApiProperty()
  expiresAt: Date;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  @ApiProperty({ required: false, nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.verifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}