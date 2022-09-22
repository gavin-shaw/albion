import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { In, MoreThan } from 'typeorm';
import { MarketHistoryRepository } from '../market-history/entities/market-history.repository';
import { MarketOrderRepository } from '../market-order/entities/market-order.repository';
import { MarketItemSpread } from './domain/market-item-spread';
import itemNames from './fixture/items.json';

const maxBuyPrice = 100000;
const minSpreadPc = 20;
const minHistoryCount = 20;

@Injectable()
export class SpreadService {
  constructor(
    private readonly marketOrderRepository: MarketOrderRepository,
    private readonly marketHistoryRepository: MarketHistoryRepository,
  ) {}

  async calculateSpreads(): Promise<MarketItemSpread[]> {
    const itemNamesMap = _(itemNames)
      .groupBy('UniqueName')
      .mapValues((values) => {
        if (!values[0]['LocalizedNames']) {
          return null;
        }
        return values[0]['LocalizedNames']['EN-US'];
      })
      .value();

    const query = this.marketOrderRepository
      .createQueryBuilder('order')
      .select([
        'order.itemId',
        'order.auctionType',
        'order.qualityLevel',
        'order.location',
        'order.enchantmentLevel',
      ])
      .addSelect('MAX(price)', 'max_price')
      .addSelect('MIN(order.price)', 'min_price')
      .groupBy('order.itemId')
      .addGroupBy('order.auctionType')
      .addGroupBy('order.qualityLevel')
      .addGroupBy('order.location')
      .addGroupBy('order.enchantmentLevel');

    const marketOrders = await query.getRawMany();

    const items = _.chain(marketOrders)
      .map((rawOrder) => {
        const marketOrderGroup: MarketOrderGroup = {
          id: `${rawOrder['location']}-${rawOrder['order_item_id']}-${rawOrder['order_quality_level']}`,
          location: rawOrder['location'],
          itemId: rawOrder['order_item_id'],
          qualityLevel: rawOrder['order_quality_level'],
          auctionType: rawOrder['order_auction_type'],
          maxPrice: Number(rawOrder['max_price']),
          minPrice: Number(rawOrder['min_price']),
        };

        return marketOrderGroup;
      })
      .groupBy('id')
      .mapValues((values) => {
        const maxRequest = _.chain(values)
          .filter((it) => it.auctionType === 'request')
          .map((it) => it.maxPrice)
          .max()
          .value();

        const minOffer = _.chain(values)
          .filter((it) => it.auctionType === 'offer')
          .map((it) => it.minPrice)
          .min()
          .value();

        const marketItem: MarketItem = {
          id: values[0].id,
          itemId: values[0].itemId,
          qualityLevel: values[0].qualityLevel,
          maxRequest,
          location: values[0].location,
          minOffer,
          spread: minOffer - maxRequest,
          spreadPc: ((minOffer - maxRequest) * 100) / maxRequest,
        };

        return marketItem;
      })
      .values()
      .filter((it) => !!it.maxRequest && !!it.minOffer)
      .filter((it) => it.maxRequest < maxBuyPrice && it.spreadPc > minSpreadPc)
      .orderBy(['spreadPc'], ['desc'])
      .value();

    const latestSale = await this.marketHistoryRepository
      .find({
        order: {
          timestamp: -1,
        },
      })
      .then((results) => results[0]);

    const sales = await _(items)
      .map((it) => it.itemId)
      .chunk(100)
      .map((them) => {
        return this.marketHistoryRepository.findBy({
          itemId: In(them),
          timestamp: MoreThan(
            moment(latestSale.timestamp).subtract(2, 'days').toDate(),
          ),
        });
      })
      .thru((promises) => Promise.all(promises).then((them) => _.flatMap(them)))
      .value();

    const salesMap = _(sales)
      .map((sale) => ({
        ...sale,
        id: `${sale.location}-${sale.itemId}-${sale.quality}`,
      }))
      .groupBy('id')
      .mapValues((values, key) => ({
        id: key,
        historyCount: values.length,
        minPrice: _(values)
          .map((it) => Number(it.silverAmount))
          .min(),
        maxPrice: _(values)
          .map((it) => Number(it.silverAmount))
          .max(),
        avgPrice: Math.floor(
          _(values)
            .map((it) => Number(it.silverAmount))
            .sum() / values.length,
        ),
      }))
      .value();

    const results = _(items)
      .filter((item) => item.spreadPc > minSpreadPc)
      .map((item) => {
        const saleData = salesMap[item.id];

        if (!saleData) {
          return undefined;
        }

        if (saleData.historyCount < minHistoryCount) {
          return undefined;
        }

        return {
          ...item,
          ...saleData,
          name: itemNamesMap[item.itemId],
        };
      })
      .filter((it) => !!it)
      .filter(
        (it) =>
          (it.minPrice - it.maxRequest) / (it.minOffer - it.maxRequest) < 0.4,
      )
      .orderBy('count')
      .value();

    return results;
  }
}

class MarketItem {
  id: string;
  itemId: string;
  qualityLevel: number;
  maxRequest: number;
  minOffer: number;
  spread: number;
  spreadPc: number;
  location: string;
}

class MarketOrderGroup {
  id: string;
  itemId: string;
  qualityLevel: number;
  auctionType: 'request' | 'offer';
  maxPrice: number;
  minPrice: number;
  location: string;
}
