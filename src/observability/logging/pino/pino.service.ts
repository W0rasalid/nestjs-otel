import { Injectable, OnModuleDestroy } from '@nestjs/common';
import pino from 'pino';
import type { LokiOptions } from 'pino-loki';
import { trace, context } from '@opentelemetry/api';

const getTraceId = () => {
  const span = trace.getSpan(context.active());
  return span?.spanContext().traceId ?? 'no-trace';
};

@Injectable()
export class PinoLoggerService implements OnModuleDestroy {
  private readonly logger: pino.Logger;
  private readonly transport: ReturnType<typeof pino.transport>;

  constructor() {
    this.transport = pino.transport<LokiOptions>({
      target: 'pino-loki',
      options: {
        batching: true,
        interval: 5,
        host: 'http://localhost:3100', // Replace with your Loki instance host
        // basicAuth: {
        //   username: 'username', // Replace with your Loki username
        //   password: 'password', // Replace with your Loki password
        // },
        labels: {
          app: 'nestjs-otel',
          environment: 'test',
          library: 'pino',
          traceId: getTraceId(),
        },
      },
    });

    this.logger = pino(this.transport);
  }

  // Expose Pino's logging methods
  error(obj: any, msg?: string, ...args: any[]) {
    this.logger.error(obj, msg, ...args);
  }

  warn(obj: any, msg?: string, ...args: any[]) {
    this.logger.warn(obj, msg, ...args);
  }

  info(obj: any, msg?: string, ...args: any[]) {
    this.logger.info(obj, msg, ...args);
  }

  debug(obj: any, msg?: string, ...args: any[]) {
    this.logger.debug(obj, msg, ...args);
  }

  trace(obj: any, msg?: string, ...args: any[]) {
    this.logger.trace(obj, msg, ...args);
  }

  fatal(obj: any, msg?: string, ...args: any[]) {
    this.logger.fatal(obj, msg, ...args);
  }

  // Important: Clean up the transport on module destruction
  async onModuleDestroy() {
    if (this.transport && typeof this.transport.end === 'function') {
      await this.transport.end();
    }
  }
}
