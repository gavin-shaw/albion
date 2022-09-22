import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketOrderEntity } from './entities/market-order.entity';
import { MarketOrderRepository } from './entities/market-order.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MarketOrderEntity])],
  providers: [MarketOrderRepository],
  exports: [MarketOrderRepository],
})
export class MarketOrderModule {}
