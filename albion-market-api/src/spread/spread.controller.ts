import { CACHE_MANAGER, Controller, Get, Inject } from '@nestjs/common';
import { MarketItemSpreadDto } from './dto/market-item-spread.dto';
import { SpreadService } from './spread.service';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';

const KEY_SPREADS = 'SPREADS';

@Controller('spread')
export class SpreadController {
  constructor(
    private spreadService: SpreadService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await this.refreshCache();
  }

  @Cron('0 0 * * * *')
  async refreshCache() {
    await this.findAll();
  }

  @Get()
  async findAll(): Promise<MarketItemSpreadDto[]> {
    return this.cacheManager.wrap(KEY_SPREADS, async () => {
      const models = await this.spreadService.calculateSpreads();

      return models.map((model) => MarketItemSpreadDto.fromModel(model));
    });
  }
}
