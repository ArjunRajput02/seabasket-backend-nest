import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { UserVerificationEntity } from "./user-verification.entity";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty()
  id: string;

  @Column({ length: 100 })
  @ApiProperty()
  name: string;

  @Index({ unique: true })
  @Column()
  @ApiProperty()
  email: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 20, nullable: true })
  @ApiProperty({ required: false, nullable: true })
  phone: string;

  @Column()
  @ApiProperty()
  password: string;

  @CreateDateColumn({ name: "created_at" })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => UserVerificationEntity, (verification) => verification.user)
  verifications: UserVerificationEntity[];
}