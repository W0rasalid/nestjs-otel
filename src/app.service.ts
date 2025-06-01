import { Injectable } from '@nestjs/common';
import { MetricService, Span, TraceService } from 'nestjs-otel';
import { Counter } from '@opentelemetry/api';

@Injectable()
export class AppService {
  private customMetricCounter: Counter;

  constructor(
    private readonly traceService: TraceService,
    private readonly metricService: MetricService,
  ) {
    this.customMetricCounter = this.metricService.getCounter('custom_counter', {
      description: 'Description for counter',
    });
  }

  @Span()
  getHello(): string {
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
