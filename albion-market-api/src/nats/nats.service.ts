import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, StringCodec } from 'nats';
import { MarketOrderRepository } from '../market-order/entities/market-order.repository';
import { MarketHistoryRepository } from '../market-history/entities/market-history.repository';
import { MarketHistoryDto } from './dto/market-history.dto';
import { MarketOrderDto } from './dto/market-order.dto';
import { MarketOrderEntity } from '../market-order/entities/market-order.entity';
import moment from 'moment';
import { MarketHistoryEntity } from '../market-history/entities/market-history.entity';

@Injectable()
export class NatsService {
  private connection: NatsConnection;

  constructor(
    private readonly configService: ConfigService,
    private readonly marketOrderRepository: MarketOrderRepository,
    private readonly marketHistoryRepository: MarketHistoryRepository,
  ) {}

  async onModuleInit() {
    this.connection = await connect({
      servers: this.configService.get('ALBION_NATS_HOST'),
      user: this.configService.get('ALBION_NATS_USER'),
      pass: this.configService.get('ALBION_NATS_PASS'),
    });

    this.listen('marketorders.deduped', (data) => this.saveMarketOrder(data));
    this.listen('markethistories.deduped', (data) =>
      this.saveMarketHistory(data),
    );
  }
  private async saveMarketHistory(data: MarketHistoryDto) {
    const entities = [];

    for (const row of data.MarketHistories) {
      let enchantmentLevel = 0;
      let itemId = data.AlbionIdString;
      if (!itemId) {
        continue
      }
      if (itemId.includes('@')) {
        enchantmentLevel = Number(itemId.split('@')[1]);
        itemId = itemId.split('@')[0];
      }

      const timestampSecs = row.Timestamp / 10000000 - 62135596800;

      const entity: MarketHistoryEntity = {
        createdAt: moment().toDate(),
        enchantmentLevel,
        id: `${data.AlbionId}-${data.LocationId}-${data.QualityLevel}-${data.Timescale}-${timestampSecs}`,
        itemAmount: row.ItemAmount,
        itemId,
        locationId: data.LocationId,
        qualityLevel: data.QualityLevel,
        silverAmount: row.SilverAmount,
        timestamp: moment.unix(timestampSecs).toDate(),
      };

      entities.push(entity);
    }

    await this.marketHistoryRepository.save(entities);

    console.log(
      `Saved History: ${data.AlbionIdString} - ${data.Timescale} - ${data.MarketHistories.length}`,
    );
  }

  private async saveMarketOrder(data: MarketOrderDto) {
    const entity: MarketOrderEntity = {
      id: data.Id.toString(),
      amount: data.Amount,
      auctionType: data.AuctionType,
      createdAt: moment().toDate(),
      enchantmentLevel: data.EnchantmentLevel,
      itemId: data.ItemGroupTypeId,
      locationId: data.LocationId,
      price: data.UnitPriceSilver,
      qualityLevel: data.QualityLevel,
      updatedAt: moment().toDate(),
    };

    await this.marketOrderRepository.save(entity);

    console.log(
      `Saved Order: ${entity.itemId} - ${
        entity.auctionType
      } - ${entity.price.toLocaleString()}`,
    );
  }

  private async listen(subject: string, handler: (data: any) => Promise<void>) {
    const sub = this.connection.subscribe(subject);

    const sc = StringCodec();

    for await (const message of sub) {
      const data = JSON.parse(sc.decode(message.data));
      handler(data);
    }
    console.log('Subscription closed');
  }
}
