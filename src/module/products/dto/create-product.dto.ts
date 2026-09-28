import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 1, description: 'Category this product belongs to' })
  @Type(() => Number)
  @IsInt()
  categoryId: number;

  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Noise-cancelling over-ear wireless headphones.' })
  @IsString()
  description?: string;

  @ApiProperty({ example: 2999 })
  // this is used to transform the input value to a number before validation
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  // APiPropertyOptional is used to indicate that this property is optional in the request body
  @ApiPropertyOptional({ example: 10, description: 'Discount percentage' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({ example: 50, description: 'Units currently in stock' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({ example: false, description: 'Show this product in the trending carousel' })
  @IsBoolean()
  isTrending?: boolean;

  @ApiProperty({ example: true, description: 'Whether the product is visible on the storefront' })
  @IsBoolean()
  isAvailable?: boolean;
}
