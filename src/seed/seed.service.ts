import { Injectable } from '@nestjs/common';
import { CategoriesSeeder } from '@/seed/seeders';

@Injectable()
export class SeedService {
  constructor(private readonly categoriesSeeder: CategoriesSeeder) {}

  // It calls the seed method of the CategoriesSeeder class to populate the database with initial category data.
  async seed() {
    await this.categoriesSeeder.seed();
  }
}
