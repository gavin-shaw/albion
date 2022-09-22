import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MarketOrderEntity } from './market-order.entity';

@Injectable()
export class MarketOrderRepository extends Repository<MarketOrderEntity> {
  constructor(dataSource: DataSource) {
    super(MarketOrderEntity, dataSource.createEntityManager());
  }
}
