import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'categories' })
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Index({ unique: true })
  @Column({ length: 100 })
  @ApiProperty()
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ required: false, nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'createdAt' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  @ApiProperty()
  updatedAt: Date;
}
