export type MarketOrderDto = Readonly<{
  Id: number;
  ItemTypeId: string;
  LocationId: number;
  QualityLevel: number;
  EnchantmentLevel: number;
  UnitPriceSilver: number;
  Amount: number;
  AuctionType: 'request' | 'offer';
  Expires: string;
  ItemGroupTypeId: string;
}>;
