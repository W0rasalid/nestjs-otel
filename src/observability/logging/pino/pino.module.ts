import { Global, Module } from '@nestjs/common';
import { PinoLoggerService } from './pino.service';

@Global()
@Module({
  providers: [PinoLoggerService],
  exports: [PinoLoggerService],
})
export class PinoLoggingModule {}
