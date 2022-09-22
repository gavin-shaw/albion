import { CacheModule, Module } from '@nestjs/common';
import { MarketOrderModule } from './market-order/market-order.module';
import { MarketHistoryModule } from './market-history/market-history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { SpreadModule } from './spread/spread.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
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
      }),
      inject: [ConfigService],
    }),
    SpreadModule,
  ],
})
export class AppModule {}
