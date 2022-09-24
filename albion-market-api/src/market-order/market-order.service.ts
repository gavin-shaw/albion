import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import _ from 'lodash';
import { DeleteResult, IsNull, LessThan } from 'typeorm';
import { MarketOrderRepository } from './entities/market-order.repository';
import { ITEM_NAMES } from '../util/utils';
import { LOCATION_NAMES } from 'src/util/utils';
import moment from 'moment';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MarketOrderService {
  constructor(
    private readonly marketOrderRepository: MarketOrderRepository,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      return;
    }

    await this.cleanOrders();
  }

  @Cron('0 0 */4 * * ')
  async cleanOrders() {
    const orders = await this.marketOrderRepository
      .createQueryBuilder('order')
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

    console.log(`${orders.length} x results`);

    const ordersToClean = _(orders)
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

    console.log(`${ordersToClean.length} x orders to clean`);

    let i = 0;
    const startMoment = moment();

    for (const order of ordersToClean) {
      i++;
      let result: DeleteResult;

      if (!ITEM_NAMES[order.itemId] || !order.location) {
        result = await this.marketOrderRepository.delete({
          locationId: order.location ?? IsNull(),
          itemId: order.itemId ?? IsNull(),
          qualityLevel: order.qualityLevel ?? IsNull(),
          enchantmentLevel: order.enchantmentLevel ?? IsNull(),
          auctionType: order.auctionType ?? IsNull(),
        });
      } else {
        result = await this.marketOrderRepository.delete({
          locationId: order.location ?? IsNull(),
          itemId: order.itemId ?? IsNull(),
          qualityLevel: order.qualityLevel ?? IsNull(),
          enchantmentLevel: order.enchantmentLevel ?? IsNull(),
          auctionType: order.auctionType ?? IsNull(),
          updatedAt: LessThan(order.updated),
        });
      }

      const secondsEstimate =
        (moment().diff(startMoment, 'seconds') / i) * ordersToClean.length;

      const finishMoment = startMoment.clone().add(secondsEstimate, 'seconds');

      console.log(
        `Cleaned ${result.affected} x ${ITEM_NAMES[order.itemId]} @ ${
          LOCATION_NAMES[order.location]
        } - ${i} / ${ordersToClean.length} - ${finishMoment.fromNow()}`,
      );
    }
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
