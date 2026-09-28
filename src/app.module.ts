import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
import { GuestModule } from './module/guest/guest.module';
import { CategoryModule } from './module/category/category.module';
import { SeedModule } from './seed/seed.module';

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
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
