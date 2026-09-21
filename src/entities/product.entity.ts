import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryEntity } from './category.entity';
import { ProductImageEntity } from './product-image.entity';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => (value === null ? null : parseFloat(value)),
};

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Index()
  @Column({ name: 'categoryId' })
  @ApiProperty()
  categoryId: number;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;

  @Column({ length: 255 })
  @ApiProperty()
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ required: false, nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  @ApiProperty()
  price: number;

  @Column({
    name: 'discountPercentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  @ApiProperty()
  discountPercentage: number;

  @Column({ name: 'stockQuantity', type: 'int', default: 0 })
  @ApiProperty()
  stockQuantity: number;

  @Index()
  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0, transformer: decimalTransformer })
  @ApiProperty()
  rating: number;

  @Column({ name: 'reviewCount', type: 'int', default: 0 })
  @ApiProperty()
  reviewCount: number;

  @Index()
  @Column({ name: 'isTrending', default: false })
  @ApiProperty()
  isTrending: boolean;

  @Index()
  @Column({ name: 'isAvailable', default: true })
  @ApiProperty()
  isAvailable: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => ProductImageEntity, (image) => image.product)
  images: ProductImageEntity[];
}
