import { Inject, Injectable } from '@nestjs/common';
import { MetricService, Span, TraceService } from 'nestjs-otel';
import { Counter } from '@opentelemetry/api';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PinoLoggerService } from './observability/logging/pino/pino.service';

@Injectable()
export class AppService {
  private customMetricCounter: Counter;

  constructor(
    private readonly traceService: TraceService,
    private readonly metricService: MetricService,
    private readonly pinoLogger: PinoLoggerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.customMetricCounter = this.metricService.getCounter('custom_counter', {
      description: 'Description for counter',
    });
  }

  @Span()
  getHello(): string {
    this.logger.info('send getHello from Winston logger');
    this.pinoLogger.info('send getHello from Pino logger');
    const currentSpan = this.traceService.getSpan();
    currentSpan.addEvent('event 1');
    currentSpan.end();

    const span = this.traceService.startSpan('sub_span'); // start new span
    span.setAttributes({ userId: 1 });
    span.end();

    return 'Hello World!';
  }

  async getMetric() {
    this.customMetricCounter.add(1);
    return [`Harry Potter and the Philosopher's Stone`];
  }
}
