import { CategoryEntity } from '@/entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CATEGORIES_SEED_DATA } from '@/seed/constants';

@Injectable()
export class CategoriesSeeder {
  private readonly logger = new Logger(CategoriesSeeder.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async seed() {
    this.logger.log('Seeding categories information');

    // Collect category names from the seed data to check for existing categories.
    const categoryNames = CATEGORIES_SEED_DATA.map((c) => c.name);

    // Fetch existing categories from the database that match the names in the seed data.
    const existing = await this.categoryRepository.find({
      where: {
        name: In(categoryNames),
      },
    });

    // Create a map of existing categories by name
    const existingByName = new Map(existing.map((existing) => [existing.name, existing]));

    // Categories that don't exist in the DB yet.
    const newCategories = CATEGORIES_SEED_DATA.filter(
      (category) => !existingByName.has(category.name),
    );

    // the seed data that need an update rather than an insert.
    const categoriesToUpdate = CATEGORIES_SEED_DATA.filter((category) => {
      const existingCategory = existingByName.get(category.name);
      return existingCategory !== undefined && existingCategory.imageUrl !== category.imageUrl;
    }).map((category) => ({
      ...existingByName.get(category.name),
      imageUrl: category.imageUrl,
    }));

    // Persist new category records.
    const savedNewCategories =
      newCategories.length > 0 ? await this.categoryRepository.save(newCategories) : [];

    // Persist imageUrl updates on existing category records.
    const savedUpdatedCategories =
      categoriesToUpdate.length > 0 ? await this.categoryRepository.save(categoriesToUpdate) : [];

    // Log the results of the seeding operation.
    this.logger.log('Categories seeded successfully.', {
      newInsertedCount: savedNewCategories.length,
      updatedCount: savedUpdatedCategories.length,
      total: CATEGORIES_SEED_DATA.length,
    });

    // Return all categories after seeding.
    return await this.categoryRepository.find();
  }
}
