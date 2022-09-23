import { Module } from '@nestjs/common';
import { NatsService } from './nats.service';
import { MarketOrderModule } from '../market-order/market-order.module';
import { MarketHistoryModule } from '../market-history/market-history.module';

@Module({
  imports: [MarketOrderModule, MarketHistoryModule],
  providers: [NatsService],
})
export class NatsModule {}
