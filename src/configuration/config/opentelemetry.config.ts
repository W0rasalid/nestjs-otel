import { registerAs } from '@nestjs/config';
import { IOpenTelemetryConfig } from '../interfaces/opentelemetry-config.interface';

const openTelemetryConfig = registerAs('otel', (): IOpenTelemetryConfig => {
  return {
    metrics: {
      hostMetrics: true,
      apiMetrics: {
        enable: true,
        defaultAttributes: {
          custom: 'label',
        },
        ignoreRoutes: ['/favicon.ico'],
        ignoreUndefinedRoutes: false,
        prefix: 'nestjs-otel-metrics',
      },
    },
  };
});

export default openTelemetryConfig;
