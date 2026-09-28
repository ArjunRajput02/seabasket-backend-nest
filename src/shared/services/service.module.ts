import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary';

@Module({
  imports: [],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class ServiceModule {}
