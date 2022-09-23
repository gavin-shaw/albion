import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'market_history' })
export class MarketHistoryEntity {
  @PrimaryColumn()
  id: string;
  @Column()
  itemAmount: number;
  @Column()
  silverAmount: number;
  @Index()
  @Column()
  itemId: string;
  @Index()
  @Column()
  enchantmentLevel: number;
  @Index()
  @Column()
  locationId: number;
  @Index()
  @Column()
  qualityLevel: number;
  @Index()
  @Column({ type: 'datetime' })
  timestamp: Date;
  @Index()
  @Column({ type: 'datetime' })
  createdAt: Date;
}
