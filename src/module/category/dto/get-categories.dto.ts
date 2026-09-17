import { ApiProperty } from '@nestjs/swagger';

export class GetCategoriesResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: 'Phones, laptops, and accessories', required: false, nullable: true })
  description: string;

  @ApiProperty({
    example: 'https://cdn.seabasket.com/categories/electronics.png',
    required: false,
    nullable: true,
  })
  imageUrl: string;
}
