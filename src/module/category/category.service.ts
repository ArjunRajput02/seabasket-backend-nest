import { CategoryEntity } from '@/entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCategoriesResponseDto } from './dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // This method returns the full list of product categories, ordered by name.
  async getAllCategories(): Promise<GetCategoriesResponseDto[]> {
    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });

    this.logger.log(`Fetched ${categories.length} categories`);

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
    }));
  }
}
