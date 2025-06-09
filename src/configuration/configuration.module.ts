import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import openTelemetryConfig from './config/opentelemetry.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [openTelemetryConfig],
    }),
  ],
})
export class ConfigurationModule {}
