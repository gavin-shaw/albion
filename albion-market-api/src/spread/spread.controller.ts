import { Controller, Get } from '@nestjs/common';
import { MarketItemSpreadDto } from './dto/market-item-spread.dto';
import { SpreadService } from './spread.service';

@Controller('spread')
export class SpreadController {
  constructor(private spreadService: SpreadService) {}

  @Get()
  async findAll(): Promise<MarketItemSpreadDto[]> {
    const models = await this.spreadService.calculateSpreads();

    return models.map((model) => MarketItemSpreadDto.fromModel(model));
  }
}
