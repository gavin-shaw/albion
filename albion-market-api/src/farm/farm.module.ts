import { Module } from '@nestjs/common';
import { FarmService } from './farm.service';
import { MarketOrderModule } from '../market-order/market-order.module';

@Module({
  imports: [MarketOrderModule],
  providers: [FarmService],
})
export class FarmModule {}
