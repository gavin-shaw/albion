export type MarketHistoryDto = Readonly<{
  AlbionId: string;
  AlbionIdString: string;
  LocationId: number;
  QualityLevel: number;
  Timescale: number;
  MarketHistories: MarketHistoryRow[];
}>;

export type MarketHistoryRow = Readonly<{
  ItemAmount: number;
  SilverAmount: number;
  Timestamp: number;
}>;
