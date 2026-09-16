import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserVerificationEntity } from './user-verification.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ length: 100 })
  @ApiProperty()
  name: string;

  @Index({ unique: true })
  @Column()
  @ApiProperty()
  email: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  @ApiProperty({ required: false, nullable: true })
  phone: string;

  @Column()
  @ApiProperty()
  password: string;

  @CreateDateColumn({ name: 'createdAt' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => UserVerificationEntity, (verification) => verification.user)
  verifications: UserVerificationEntity[];
}
