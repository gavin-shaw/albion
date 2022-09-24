import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { LOCATION_NAMES } from 'src/util/utils';
import { In, MoreThan } from 'typeorm';
import { MarketHistoryRepository } from '../market-history/entities/market-history.repository';
import { MarketOrderRepository } from '../market-order/entities/market-order.repository';
import { CacheService } from '../shared/cache/cache.service';
import { ITEM_NAMES } from '../util/utils';
import { MarketItemSpread } from './domain/market-item-spread';

@Injectable()
export class SpreadService {
  constructor(
    private readonly marketOrderRepository: MarketOrderRepository,
    private readonly marketHistoryRepository: MarketHistoryRepository,
    private readonly cacheService: CacheService,
  ) {}

  async calculateSpreads(): Promise<MarketItemSpread[]> {
    const maxBuyPrice = 1000000;
    const minSpreadPc = 20;
    const minHistoryCount = 20;

    const query = this.getMarketOrderQuery();

    console.log('Calculating spreads');

    const marketOrders = await this.cacheService.wrap(
      'MARKET_ORDERS_V3',
      () => query.getRawMany(),
      { ttl: 500 },
    );

    console.log(`Retrieved ${marketOrders.length} market orders`);

    const items = this.groupMarketOrdersByItem(
      marketOrders,
      maxBuyPrice,
      minSpreadPc,
    );

    console.log(`Grouped into ${items.length} unique items`);

    const salesMap = await this.cacheService.wrap(
      `SALES_MAP_${maxBuyPrice}_${minSpreadPc}_${minHistoryCount}_V4`,
      () => this.getSalesForItems(items, minHistoryCount),
      { ttl: 3600 },
    );

    console.log(`Fetched ${_.values(salesMap).length} grouped historic sales`);

    const results = _(items)
      .map((item) => {
        const saleData = salesMap[item.id];

        if (!saleData) {
          return undefined;
        }

        return {
          ...saleData,
          ...item,
          location:
            LOCATION_NAMES[item.locationId] ?? item.locationId.toString(),
          name: ITEM_NAMES[item.itemId],
        };
      })
      .filter((it) => !!it)
      .filter(
        (it) =>
          (it.minPrice - it.maxRequest) / (it.minOffer - it.maxRequest) < 0.4,
      )
      .value();

    console.log(`Returning ${results.length} results`);

    return results;
  }

  private async getSalesForItems(items: MarketItem[], minHistoryCount: number) {
    const latestSale = await this.cacheService.wrap(
      'LATEST_SALE_V3',
      () =>
        this.marketHistoryRepository
          .find({
            take: 1,
            order: {
              timestamp: -1,
            },
          })
          .then((results) => results[0]),
      { ttl: 3600 },
    );

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

    return _(sales)
      .map((sale) => ({
        ...sale,
        id: `${sale.locationId}-${sale.itemId}-${sale.qualityLevel}-${sale.enchantmentLevel}`,
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
      .values()
      .filter((it) => it.historyCount > minHistoryCount)
      .groupBy('id')
      .mapValues((values) => values[0])
      .value();
  }

  private groupMarketOrdersByItem(
    marketOrders: any[],
    maxBuyPrice: number,
    minSpreadPc: number,
  ) {
    return _(marketOrders)
      .map((rawOrder) => {
        const marketOrderGroup: MarketOrderGroup = {
          id: `${rawOrder['order_location_id']}-${rawOrder['order_item_id']}-${rawOrder['order_quality_level']}-${rawOrder['order_enchantment_level']}`,
          locationId: rawOrder['order_location_id'],
          itemId: rawOrder['order_item_id'],
          qualityLevel: rawOrder['order_quality_level'],
          enchantmentLevel: rawOrder['order_enchantment_level'],
          auctionType: rawOrder['order_auction_type'],
          maxPrice: Number(rawOrder['max_price']),
          minPrice: Number(rawOrder['min_price']),
          updated: rawOrder['max_updated'],
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

        const updated = _(values)
          .map((it) => moment(it.updated).unix())
          .max();

        const marketItem: MarketItem = {
          id: values[0].id,
          itemId: values[0].itemId,
          qualityLevel: values[0].qualityLevel,
          enchantmentLevel: values[0].enchantmentLevel,
          maxRequest,
          locationId: values[0].locationId,
          minOffer,
          spread: minOffer - maxRequest,
          spreadPc: ((minOffer - maxRequest) * 100) / maxRequest,
          updated,
        };

        return marketItem;
      })
      .values()
      .filter((it) => !!it.maxRequest && !!it.minOffer)
      .filter((it) => it.maxRequest < maxBuyPrice && it.spreadPc > minSpreadPc)
      .value();
  }

  private getMarketOrderQuery() {
    return this.marketOrderRepository
      .createQueryBuilder('order')
      .select([
        'order.itemId',
        'order.auctionType',
        'order.qualityLevel',
        'order.locationId',
        'order.enchantmentLevel',
      ])
      .addSelect('MAX(order.price)', 'max_price')
      .addSelect('MIN(order.price)', 'min_price')
      .addSelect('MAX(order.updated_at)', 'max_updated')
      .where('order.location_id = 3008')
      .groupBy('order.itemId')
      .addGroupBy('order.auctionType')
      .addGroupBy('order.qualityLevel')
      .addGroupBy('order.locationId')
      .addGroupBy('order.enchantmentLevel');
  }
}

class MarketItem {
  id: string;
  itemId: string;
  qualityLevel: number;
  enchantmentLevel: number;
  maxRequest: number;
  minOffer: number;
  spread: number;
  spreadPc: number;
  locationId: number;
  updated: number;
}

class MarketOrderGroup {
  id: string;
  itemId: string;
  qualityLevel: number;
  auctionType: 'request' | 'offer';
  maxPrice: number;
  minPrice: number;
  locationId: number;
  enchantmentLevel: number;
  updated: Date;
}
