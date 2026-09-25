import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { GetCategoriesResponseDto } from './dto';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Returns the full list of product categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories fetched.',
    type: [GetCategoriesResponseDto],
  })
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }
}
