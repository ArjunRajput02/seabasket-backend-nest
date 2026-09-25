import { ProductEntity, ProductImageEntity } from '@/entities';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '@/shared/services/cloudinary';
import {
  AddProductImageRequestDto,
  CreateProductDto,
  GetProductsQueryDto,
  GetProductsResponseDto,
  ProductSortBy,
  UpdateProductDto,
  AddProductImageResponseDto,
} from './dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductImageEntity)
    private readonly productImageRepository: Repository<ProductImageEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // This method returns a list of products based on the provided query parameters, such as category, price range, rating, discount, and sort order.
  async getAllProducts(query: GetProductsQueryDto): Promise<GetProductsResponseDto[]> {
    const { categoryId, minPrice, maxPrice, minRating, minDiscount, sortBy } = query;

    // queryBuilder is used  here to build a dynamic query based on the provided filters and sorting options.
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

    // Apply filters based on rating
    if (minRating !== undefined) {
      queryBuilder.andWhere('product.rating >= :minRating', { minRating });
    }
    // Apply filters based on discount percentage
    if (minDiscount !== undefined) {
      queryBuilder.andWhere('product.discountPercentage >= :minDiscount', { minDiscount });
    }

    // Apply sorting based on the provided sortBy parameter
    this.applySort(queryBuilder, sortBy);

    // Execute the query and fetch the products from the database
    const products = await queryBuilder.getMany();

    // return the products mapped to the GetProductsResponseDto format
    return products.map((product) => this.toResponseDto(product));
  }

  // Returns products flagged as trending for the homepage carousel.
  async getTrendingProducts(): Promise<GetProductsResponseDto[]> {
    const products = await this.buildBaseQuery()
      .andWhere('product.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('product.isTrending = :isTrending', { isTrending: true })
      .orderBy('product.createdAt', 'DESC')
      .getMany();

    return products.map((product) => this.toResponseDto(product));
  }

  // this method creates a new product
  async createProduct(createProductDto: CreateProductDto): Promise<GetProductsResponseDto> {
    const {
      categoryId,
      name,
      description,
      price,
      discountPercentage = 0,
      stockQuantity = 0,
      isTrending = false,
      isAvailable = true,
    } = createProductDto;

    const product = this.productRepository.create({
      categoryId: categoryId,
      name: name,
      description: description,
      price: price,
      discountPercentage: discountPercentage,
      stockQuantity: stockQuantity,
      isTrending: isTrending,
      isAvailable: isAvailable,
    });

    // save the new product to the database
    const saved = await this.productRepository.save(product);

    // return the newly created product in GetProductsResponseDto format
    return this.getProductById(saved.id);
  }

  // this method updates an existing product based on the provided ID and UpdateProductDto.
  // It first checks if the product exists then updates
  // saves the changes to the database.
  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<GetProductsResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    const {
      categoryId,
      name,
      price,
      description,
      discountPercentage,
      stockQuantity,
      isTrending,
      isAvailable,
    } = updateProductDto;

    // If the product is not found, log an error and throw a NotFoundException.
    if (!product) {
      this.logger.error('Product not found', { id });
      throw new NotFoundException('Product not found');
    }

    if (categoryId !== undefined) {
      product.categoryId = categoryId;
    }

    if (name !== undefined) {
      product.name = name;
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (discountPercentage !== undefined) {
      product.discountPercentage = discountPercentage;
    }

    if (stockQuantity !== undefined) {
      product.stockQuantity = stockQuantity;
    }

    if (isTrending !== undefined) {
      product.isTrending = isTrending;
    }

    if (isAvailable !== undefined) {
      product.isAvailable = isAvailable;
    }

    // Save the updated product to the database and return the updated product in GetProductsResponseDto format.
    const saved = await this.productRepository.save(product);

    return this.getProductById(saved.id);
  }

  // This method adds an image to a product
  async addProductImage(
    file: Express.Multer.File,
    addProductImageRequestDto: AddProductImageRequestDto,
  ): Promise<AddProductImageResponseDto> {
    const { productId, isPrimary } = addProductImageRequestDto;

    // Check the product exists before uploading anything.
    await this.ensureProductExists(productId);

    // Upload the file to Cloudinary and get back the hosted image URL.
    const imageUrl = await this.cloudinaryService.uploadImage({
      buffer: file.buffer,
      folder: 'products',
    });

    if (!imageUrl) {
      this.logger.error('Failed to upload image to Cloudinary', { productId });
      throw new InternalServerErrorException('Failed to upload image to Cloudinary');
    }

    const savedImage = await this.saveProductImage(productId, imageUrl, isPrimary ?? false);

    return {
      message: 'Product image uploaded successfully.',
      id: savedImage.id,
      productId: savedImage.productId,
      imageUrl: savedImage.imageUrl,
      isPrimary: savedImage.isPrimary,
    };
  }

  // This method checks whether a product exists and throws if it doesn't.
  private async ensureProductExists(productId: number): Promise<void> {
    const exists = await this.productRepository.exists({ where: { id: productId } });

    if (!exists) {
      this.logger.error('Product not found', { id: productId });
      throw new NotFoundException('Product not found');
    }
  }

  // This method saves a new product image row
  private async saveProductImage(
    productId: number,
    imageUrl: string,
    isPrimary: boolean,
  ): Promise<ProductImageEntity> {
    // If the new image is being set as primary, demote any existing primary image for that product.
    if (isPrimary) {
      await this.productImageRepository.update(
        { productId, isPrimary: true },
        { isPrimary: false },
      );
    }

    // Create the new product image entity in the database.
    const image = this.productImageRepository.create({ productId, imageUrl, isPrimary });
    // Save the new product image entity to the database and return it.
    return this.productImageRepository.save(image);
  }

  // This method fetches a product by its ID and returns it in the GetProductsResponseDto format.
  private async getProductById(id: number): Promise<GetProductsResponseDto> {
    const product = await this.buildBaseQuery().andWhere('product.id = :id', { id }).getOne();

    if (!product) {
      this.logger.error('Product not found', { id });
      throw new NotFoundException('Product not found');
    }

    return this.toResponseDto(product);
  }

  // This method builds a base query for fetching products, including their associated category and primary image.
  private buildBaseQuery() {
    // The base query selects products and joins their associated category and primary image for further filtering and sorting.
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
    // sort the products based on the provided sortBy parameter.
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

  // This method converts a ProductEntity instance into a GetProductsResponseDto format.
  private toResponseDto(product: ProductEntity): GetProductsResponseDto {
    const [primaryImage] = product.images ?? [];
    const {
      id,
      name,
      description,
      price,
      discountPercentage,
      rating,
      reviewCount,
      isTrending,
      isAvailable,
      category,
      categoryId,
    } = product;

    return {
      id: id,
      name: name,
      description: description,
      price: price,
      discountPercentage: discountPercentage,
      rating: rating,
      reviewCount: reviewCount,
      isTrending: isTrending,
      isAvailable: isAvailable,
      categoryId: categoryId,
      categoryName: category?.name,
      imageUrl: primaryImage?.imageUrl ?? null,
    };
  }
}
