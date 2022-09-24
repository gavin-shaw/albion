import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { MarketHistoryModule } from './market-history/market-history.module';
import { MarketOrderModule } from './market-order/market-order.module';
import { SharedModule } from './shared/shared.module';
import { SpreadModule } from './spread/spread.module';
import { NatsModule } from './nats/nats.module';
import { FarmModule } from './farm/farm.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ScheduleModule.forRoot(),
    MarketOrderModule,
    MarketHistoryModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST'),
        port: configService.get('MYSQL_PORT'),
        username: 'root',
        password: configService.get('MYSQL_PWD'),
        database: 'albion',
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    SpreadModule,
    SharedModule,
    NatsModule,
    FarmModule,
  ],
})
export class AppModule {}
