import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { GetProductsQueryDto, GetProductsResponseDto } from './dto';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({
    summary: 'Get product list',
    description:
      'Returns the storefront product list. Publicly accessible with or without login. Supports filtering by category, price range, rating and discount, and sorting by price or name.',
  })
  @ApiResponse({ status: 200, description: 'Products fetched.', type: [GetProductsResponseDto] })
  getAllProducts(@Query() query: GetProductsQueryDto) {
    return this.productService.getAllProducts(query);
  }

  @Get('trending')
  @ApiOperation({
    summary: 'Get trending products',
    description:
      'Returns trending products for the homepage carousel. Publicly accessible with or without login.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trending products fetched.',
    type: [GetProductsResponseDto],
  })
  getTrendingProducts() {
    return this.productService.getTrendingProducts();
  }
}
