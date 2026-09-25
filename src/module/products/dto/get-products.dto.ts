import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export enum ProductSortBy {
  PRICE_LOW_TO_HIGH = 'price_low_to_high',
  PRICE_HIGH_TO_LOW = 'price_high_to_low',
  NAME = 'name',
}

export class GetProductsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter products by category id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ example: 500, description: 'Minimum price, inclusive' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Maximum price, inclusive' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: 4, description: 'Minimum average rating (0-5), inclusive' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Minimum discount percentage (0-100), inclusive',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  minDiscount?: number;

  @ApiPropertyOptional({
    enum: ProductSortBy,
    example: ProductSortBy.PRICE_LOW_TO_HIGH,
    description: 'Sort order for the product list',
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy;
}

export class GetProductsResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Wireless Headphones' })
  name: string;

  @ApiProperty({
    example: 'Noise-cancelling over-ear wireless headphones.',
    required: false,
    nullable: true,
  })
  description: string;

  @ApiProperty({ example: 2999 })
  price: number;

  @ApiProperty({ example: 10 })
  discountPercentage: number;

  @ApiProperty({ example: 4.3 })
  rating: number;

  @ApiProperty({ example: 128 })
  reviewCount: number;

  @ApiProperty({ example: true })
  isTrending: boolean;

  @ApiProperty({ example: true })
  isAvailable: boolean;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: 'Electronics' })
  categoryName: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/c33ltmpg/image/upload/products/headphones.png',
    required: false,
    nullable: true,
  })
  imageUrl: string;
}
