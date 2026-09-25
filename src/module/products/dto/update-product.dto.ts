import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// partialType is a utility function provided by NestJS that creates a new DTO class based on an existing one
// making all properties optional.
// UpdateProductDto extends CreateProductDto, allowing for partial updates of product data.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
