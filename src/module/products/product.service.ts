import { ProductEntity } from '@/entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetProductsQueryDto, GetProductsResponseDto, ProductSortBy } from './dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  // This method returns a list of products based on the provided query parameters, such as category, price range, rating, discount, and sort order.
  async getAllProducts(query: GetProductsQueryDto): Promise<GetProductsResponseDto[]> {
    const { categoryId, minPrice, maxPrice, minRating, minDiscount, sortBy } = query;

    // queryBuilder is used  here to build a dynamic SQL query based on the provided filters and sorting options.
    const queryBuilder = this.buildBaseQuery().andWhere('product.isAvailable = :isAvailable', {
      isAvailable: true,
    });

    // Apply filter based on the category
    if (categoryId !== undefined) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Apply filters based on price range
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (minRating !== undefined) {
      queryBuilder.andWhere('product.rating >= :minRating', { minRating });
    }

    if (minDiscount !== undefined) {
      queryBuilder.andWhere('product.discountPercentage >= :minDiscount', { minDiscount });
    }

    // Apply sorting based on the provided sortBy parameter
    this.applySort(queryBuilder, sortBy);

    // Execute the query and fetch the products from the database
    const products = await queryBuilder.getMany();

    if (products.length === 0) {
      this.logger.error('No products found for the given filters', query);
      return [];
    }

    this.logger.log(`Fetched ${products.length} products`);

    return products.map((product) => this.toResponseDto(product));
  }

  // Returns products flagged as trendingfor the homepage carousel.
  async getTrendingProducts(): Promise<GetProductsResponseDto[]> {
    const products = await this.buildBaseQuery()
      .andWhere('product.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('product.isTrending = :isTrending', { isTrending: true })
      .orderBy('product.createdAt', 'DESC')
      .getMany();

    if (products.length === 0) {
      this.logger.error('No trending products found');
      return [];
    }

    this.logger.log(`Fetched ${products.length} trending products`);

    return products.map((product) => this.toResponseDto(product));
  }

  // This method builds the base query for fetching products, including joins with the category and primary image tables.
  private buildBaseQuery() {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'primaryImage', 'primaryImage.isPrimary = :isPrimary', {
        isPrimary: true,
      });
  }

  // This method applies sorting to the query builder based on the provided sortBy parameter.
  private applySort(
    queryBuilder: ReturnType<ProductService['buildBaseQuery']>,
    sortBy?: ProductSortBy,
  ) {
    switch (sortBy) {
      case ProductSortBy.PRICE_LOW_TO_HIGH:
        queryBuilder.orderBy('product.price', 'ASC');
        break;
      case ProductSortBy.PRICE_HIGH_TO_LOW:
        queryBuilder.orderBy('product.price', 'DESC');
        break;
      case ProductSortBy.NAME:
        queryBuilder.orderBy('product.name', 'ASC');
        break;
      default:
        queryBuilder.orderBy('product.createdAt', 'DESC');
    }
  }

  private toResponseDto(product: ProductEntity): GetProductsResponseDto {
    const [primaryImage] = product.images ?? [];

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isTrending: product.isTrending,
      isAvailable: product.isAvailable,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      imageUrl: primaryImage?.imageUrl ?? null,
    };
  }
}
