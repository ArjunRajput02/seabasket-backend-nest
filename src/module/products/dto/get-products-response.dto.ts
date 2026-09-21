import { ApiProperty } from '@nestjs/swagger';

export class GetProductsResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Wireless Headphones' })
  name: string;

  @ApiProperty({
    example: 'Noise-cancelling wireless headphones.',
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
