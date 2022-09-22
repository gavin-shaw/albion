export type MarketItemSpread = Readonly<{
  avgPrice: number;
  historyCount: number;
  id: string;
  itemId: string;
  maxPrice: number;
  maxRequest: number;
  minOffer: number;
  minPrice: number;
  name: string;
  qualityLevel: number;
  spread: number;
  spreadPc: number;
  location: string;
}>;
