import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'market_history' })
export class MarketHistoryEntity {
  @PrimaryColumn()
  id: number;
  @Column()
  itemAmount: number;
  @Column()
  silverAmount: number;
  @Column()
  itemId: string;
  @Column()
  location: number;
  @Column()
  quality: number;
  @Column({ type: 'datetime' })
  timestamp: Date;
  @Column()
  aggregation: number;
}
