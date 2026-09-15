import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "./user.entity";

@Entity({ name: "password_reset_tokens" })
export class PasswordResetTokenEntity {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty()
  id: string;

  @Column({ name: "user_id" })
  userId: string;

  @Index({ unique: true })
  @Column({ name: "token_hash" })
  tokenHash: string;

  @Column({ name: "expires_at", type: "timestamp" })
  @ApiProperty()
  expiresAt: Date;

  @Column({ name: "used_at", type: "timestamp", nullable: true })
  @ApiProperty({ required: false, nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: "created_at" })
  @ApiProperty()
  createdAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
}