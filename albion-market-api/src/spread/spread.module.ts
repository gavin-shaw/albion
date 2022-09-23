import { Module } from '@nestjs/common';
import { MarketHistoryModule } from '../market-history/market-history.module';
import { MarketOrderModule } from '../market-order/market-order.module';
import { SpreadController } from './spread.controller';
import { SpreadService } from './spread.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [MarketOrderModule, MarketHistoryModule, SharedModule],
  providers: [SpreadService],
  controllers: [SpreadController],
})
export class SpreadModule {}
