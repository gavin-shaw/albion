import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketHistoryEntity } from './entities/market-history.entity';
import { MarketHistoryRepository } from './entities/market-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MarketHistoryEntity])],
  providers: [MarketHistoryRepository],
  exports: [MarketHistoryRepository],
})
export class MarketHistoryModule {}
