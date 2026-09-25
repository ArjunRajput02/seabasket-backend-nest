import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '@/entities';
import { SeedService } from '@/seed/seed.service';
import { CategoriesSeeder } from '@/seed/seeders';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  providers: [CategoriesSeeder, SeedService],
  exports: [SeedService],
})
export class SeedModule {}
