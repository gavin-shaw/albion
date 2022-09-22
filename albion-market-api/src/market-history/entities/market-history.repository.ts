import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MarketHistoryEntity } from './market-history.entity';

@Injectable()
export class MarketHistoryRepository extends Repository<MarketHistoryEntity> {
  constructor(dataSource: DataSource) {
    super(MarketHistoryEntity, dataSource.createEntityManager());
  }
}
