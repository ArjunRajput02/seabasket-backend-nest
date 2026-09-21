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
import { ProductEntity } from './product.entity';

@Entity({ name: 'product_images' })
export class ProductImageEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Index()
  @Column({ name: 'productId' })
  @ApiProperty()
  productId: number;

  @ManyToOne(() => ProductEntity, (product) => product.images)
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({ name: 'imageUrl', type: 'text' })
  @ApiProperty()
  imageUrl: string;

  @Column({ name: 'isPrimary', default: false })
  @ApiProperty()
  isPrimary: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  @ApiProperty()
  createdAt: Date;
}
