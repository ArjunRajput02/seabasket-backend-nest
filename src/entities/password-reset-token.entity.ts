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

@Entity({ name: 'password_reset_tokens' })
export class PasswordResetTokenEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  userId: number;

  @Index({ unique: true })
  @Column()
  @ApiProperty()
  tokenHash: string;

  @Column({ type: 'timestamp' })
  @ApiProperty()
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({ required: false, nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
