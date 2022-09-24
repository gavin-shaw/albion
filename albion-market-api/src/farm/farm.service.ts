import { Injectable } from '@nestjs/common';
import { MarketOrderRepository } from '../market-order/entities/market-order.repository';
import _ from 'lodash';
import { In, MoreThan } from 'typeorm';
import moment from 'moment';

const MATRIX = {
  T1_CARROT: 'T1_FARM_CARROT_SEED',
  T2_AGARIC: 'T2_FARM_AGARIC_SEED',
  T2_BEAN: 'T2_FARM_BEAN_SEED',
  T3_COMFREY: 'T3_FARM_COMFREY_SEED',
  T3_WHEAT: 'T3_FARM_WHEAT_SEED',
  T4_BURDOCK: 'T4_FARM_BURDOCK_SEED',
  T4_TURNIP: 'T4_FARM_TURNIP_SEED',
  T5_CABBAGE: 'T5_FARM_CABBAGE_SEED',
  T5_TEASEL: 'T5_FARM_TEASEL_SEED',
};

@Injectable()
export class FarmService {
  constructor(private readonly marketOrderRepository: MarketOrderRepository) {}

  async findProfits(farmPlots: number) {
    const itemIds = _(MATRIX)
      .mapValues((value, key) => [value, key])
      .values()
      .flatMap()
      .value();

    const offers = await this.marketOrderRepository.findBy({
      itemId: In(itemIds),
      locationId: 3008,
      auctionType: 'offer',
      updatedAt: MoreThan(moment().subtract(5, 'hours').toDate()),
    });

    const prices = _(offers)
      .groupBy((it) => `${it.itemId}-${moment(it.updatedAt).unix()}`)
      .mapValues((values) => ({
        updatedAt: moment(values[0].updatedAt).unix(),
        itemId: values[0].itemId,
        price: _(values)
          .map((value) => value.price)
          .min(),
      }))
      .values()
      .groupBy('itemId')
      .mapValues((values) => _(values).maxBy('updatedAt').price)
      .value();

    const profits = _(MATRIX)
      .mapValues((seed, crop) => {
        const seedPrice = prices[seed];
        const cropPrice = prices[crop];
        const cost = 9 * seedPrice * farmPlots;
        const revenue = 9 * 9 * cropPrice * farmPlots;
        const profit = revenue - cost;

        return {
          crop,
          cropPrice,
          seed,
          seedPrice,
          cost,
          revenue,
          profit,
        };
      })
      .values()
      .orderBy('crop')
      .value();

    console.log(profits);
  }
}
