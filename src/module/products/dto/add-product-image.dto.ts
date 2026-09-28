import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class AddProductImageRequestDto {
  @ApiProperty({
    example: 1,
    description: 'Product this image belongs to',
  })
  @Type(() => Number)
  @IsInt()
  productId: number;

  @ApiPropertyOptional({
    example: false,
    description:
      'Mark this as the product primary/thumbnail image. Setting this demotes any existing primary image for the product.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? undefined : value === true || value === 'true',
  )
  @IsBoolean()
  isPrimary?: boolean;
}

export class AddProductImageResponseDto {
  @ApiProperty({
    example: 'Product image uploaded successfully.',
  })
  message: string;

  @ApiProperty({
    example: 15,
    description: 'ID of the uploaded product image',
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the product this image belongs to',
  })
  productId: number;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/v123456/products/product.jpg',
    description: 'Cloudinary URL of the uploaded image',
  })
  imageUrl: string;

  @ApiProperty({
    example: true,
    description: 'Whether this image is the primary product image',
  })
  isPrimary: boolean;
}
