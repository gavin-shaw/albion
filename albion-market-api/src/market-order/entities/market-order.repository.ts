import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { MarketOrderEntity } from './market-order.entity';

@Injectable()
export class MarketOrderRepository extends Repository<MarketOrderEntity> {
  constructor(dataSource: DataSource) {
    super(MarketOrderEntity, dataSource.createEntityManager());
  }

  async findLatestOrdersByItemIds() {
    const orders = await this.createQueryBuilder('order')
      .select([
        'order.itemId',
        'order.auctionType',
        'order.qualityLevel',
        'order.locationId',
        'order.enchantmentLevel',
        'order.updatedAt',
      ])
      .groupBy('order.itemId')
      .addGroupBy('order.auctionType')
      .addGroupBy('order.qualityLevel')
      .addGroupBy('order.locationId')
      .addGroupBy('order.enchantmentLevel')
      .addGroupBy('order.updatedAt')
      .getRawMany();

    return _(orders)
      .map((rawOrder) => {
        const marketOrderGroup: MarketOrderGroup = {
          location: rawOrder['order_location_id'],
          itemId: rawOrder['order_item_id'],
          qualityLevel: rawOrder['order_quality_level'],
          enchantmentLevel: rawOrder['order_enchantment_level'],
          auctionType: rawOrder['order_auction_type'],
          updated: rawOrder['order_updated_at'],
        };

        return marketOrderGroup;
      })
      .groupBy(
        (it) =>
          `${it.location}-${it.itemId}-${it.qualityLevel}-${it.auctionType}-${it.enchantmentLevel}`,
      )
      .values()
      .filter((values) => values.length > 1)
      .map((values) => ({
        ...values[0],
        updated: _(values)
          .map((it) => it.updated)
          .max(),
      }))
      .value();
  }
}

class MarketOrderGroup {
  itemId: string;
  qualityLevel: number;
  auctionType: 'request' | 'offer';
  location: number;
  enchantmentLevel: number;
  updated: Date;
}
