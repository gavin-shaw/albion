import { Module } from '@nestjs/common';
import { SpreadService } from './spread.service';
import { MarketOrderModule } from '../market-order/market-order.module';
import { MarketHistoryModule } from '../market-history/market-history.module';
import { SpreadController } from './spread.controller';

@Module({
  imports: [MarketOrderModule, MarketHistoryModule],
  providers: [SpreadService],
  controllers: [SpreadController],
})
export class SpreadModule {}
