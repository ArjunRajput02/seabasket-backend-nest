import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
import { GuestModule } from './module/guest/guest.module';
import { CategoryModule } from './module/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    GuestModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
