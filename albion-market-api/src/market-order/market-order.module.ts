import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketOrderEntity } from './entities/market-order.entity';
import { MarketOrderRepository } from './entities/market-order.repository';
import { MarketOrderService } from './market-order.service';

@Module({
  imports: [TypeOrmModule.forFeature([MarketOrderEntity])],
  providers: [MarketOrderRepository, MarketOrderService],
  exports: [MarketOrderRepository],
})
export class MarketOrderModule {}
