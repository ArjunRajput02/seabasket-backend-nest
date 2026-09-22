import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ProductService } from './product.service';
import {
  AddProductImageRequestDto,
  AddProductImageResponseDto,
  CreateProductDto,
  GetProductsQueryDto,
  GetProductsResponseDto,
  UpdateProductDto,
} from './dto';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({
    summary: 'Get product list',
    description:
      'Returns the storefront product list. Publicly accessible with or without login. Supports filtering by category, price range, rating and discount, and sorting by price (low to high / high to low) or name.',
  })
  @ApiResponse({ status: 200, description: 'Products fetched.', type: [GetProductsResponseDto] })
  getAllProducts(@Query() query: GetProductsQueryDto) {
    return this.productService.getAllProducts(query);
  }

  @Get('trending')
  @ApiOperation({
    summary: 'Get trending products',
    description:
      'Returns products flagged as trending (isTrending = true), for the homepage carousel. Publicly accessible with or without login.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trending products fetched.',
    type: [GetProductsResponseDto],
  })
  getTrendingProducts() {
    return this.productService.getTrendingProducts();
  }

  @Post()
  @ApiOperation({
    summary: 'Add a new product',
  })
  @ApiResponse({ status: 201, description: 'Product created.', type: GetProductsResponseDto })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Edit an existing product',
    description: 'Partial update only send the fields you want to change.',
  })
  @ApiResponse({ status: 200, description: 'Product updated.', type: GetProductsResponseDto })
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Post('images')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'productId'],
      properties: {
        file: { type: 'string', format: 'binary' },
        productId: { type: 'integer', example: 1 },
        isPrimary: { type: 'boolean', example: false },
      },
    },
  })
  @ApiOperation({
    summary: 'Add an image to a product',
    description:
      'Uploads the given file to Cloudinary and adds the resulting URL as a product image. Set isPrimary to make it the product thumbnail this demotes any existing primary image.',
  })
  @ApiResponse({ status: 201, description: 'Image added.', type: AddProductImageResponseDto })
  addProductImage(
    // The UploadedFile decorator extracts the uploaded file from the request
    // multer handles the file upload and stores it in memory for processing.
    @UploadedFile() file: Express.Multer.File,
    @Body() addProductImageRequestDto: AddProductImageRequestDto,
  ) {
    return this.productService.addProductImage(file, addProductImageRequestDto);
  }
}
