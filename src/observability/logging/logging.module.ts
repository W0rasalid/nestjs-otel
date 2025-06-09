import { Module } from '@nestjs/common';
import { WinstonLoggingModule } from './winston/winston.module';
import { PinoLoggingModule } from './pino/pino.module';

@Module({
  imports: [WinstonLoggingModule, PinoLoggingModule],
})
export class LoggingModule {}
