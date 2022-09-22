import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'market_orders' })
export class MarketOrderEntity {
  @PrimaryColumn()
  id: number;
  @Column()
  albionId: number;
  @Column({ nullable: true })
  itemId: string;
  @Column({ nullable: true })
  qualityLevel: number;
  @Column({ nullable: true })
  enchantmentLevel: number;
  @Column({ nullable: true })
  price: number;
  @Column({ nullable: true })
  initialAmount: number;
  @Column({ nullable: true })
  amount: number;
  @Column({ nullable: true })
  auctionType: string;
  @Column({ type: 'datetime' })
  expires: Date;
  @Column()
  location: number;
  @Column({ type: 'datetime' })
  createdAt: Date;
  @Column({ type: 'datetime' })
  updatedAt: Date;
  @Column({ type: 'datetime' })
  deletedAt: Date;
}
