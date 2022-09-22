import { MarketItemSpread } from '../domain/market-item-spread';

export class MarketItemSpreadDto {
  readonly avgPrice: number;
  readonly historyCount: number;
  readonly id: string;
  readonly itemId: string;
  readonly maxPrice: number;
  readonly maxRequest: number;
  readonly minOffer: number;
  readonly minPrice: number;
  readonly name: string;
  readonly qualityLevel: number;
  readonly spread: number;
  readonly spreadPc: number;
  readonly location: string;

  static fromModel(model: MarketItemSpread): MarketItemSpreadDto {
    return {
      ...model,
    };
  }
}
