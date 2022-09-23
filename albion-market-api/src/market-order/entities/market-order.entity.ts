import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'market_orders' })
export class MarketOrderEntity {
  @PrimaryColumn()
  id: string;
  @Index()
  @Column({ nullable: true })
  itemId: string;
  @Index()
  @Column({ nullable: true })
  qualityLevel: number;
  @Index()
  @Column({ nullable: true })
  enchantmentLevel: number;
  @Column({ nullable: true })
  price: number;
  @Column({ nullable: true })
  amount: number;
  @Index()
  @Column({ nullable: true })
  auctionType: string;
  @Index()
  @Column()
  locationId: number;
  @Index()
  @Column({ type: 'datetime' })
  createdAt: Date;
  @Index()
  @Column({ type: 'datetime' })
  updatedAt: Date;
}
