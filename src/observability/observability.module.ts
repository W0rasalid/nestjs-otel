import { Module } from '@nestjs/common';
import { OpenTelemetryModule } from 'nestjs-otel';
import { ConfigService } from '@nestjs/config';
import { IOpenTelemetryConfig } from 'src/configuration/interfaces/opentelemetry-config.interface';

@Module({
  imports: [
    OpenTelemetryModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get<IOpenTelemetryConfig>('otel'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class ObservabilityModule {}
