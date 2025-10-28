import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { Distribution } from '../distributions/entities/distribution.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Category } from '../categories/entities/category.entity';
import { LoggingModule } from '../../common/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Item, Distribution, Inventory, Category]),
    LoggingModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

