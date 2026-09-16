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
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  userId: number;

  @Column()
  @ApiProperty()
  token: string;

  @Column({ type: 'timestamp' })
  @ApiProperty()
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({ required: false, nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.verifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
