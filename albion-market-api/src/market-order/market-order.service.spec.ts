import { Test, TestingModule } from '@nestjs/testing';
import { MarketOrderService } from './market-order.service';

describe('MarketOrderService', () => {
  let service: MarketOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketOrderService],
    }).compile();

    service = module.get<MarketOrderService>(MarketOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
