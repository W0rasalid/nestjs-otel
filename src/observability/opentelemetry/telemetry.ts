// src/opentelemetry.config.ts หรือไฟล์ที่เกี่ยวข้อง
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'; // หรือ '@opentelemetry/exporter-trace-otlp-grpc'
// import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'; // หรือ gRPC ถ้าใช้ gRPC
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources'; // Correct import path
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// ***  instrumentations ที่ต้องการปรับแต่ง ***
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
  NestInstrumentation,
  AttributeNames,
} from '@opentelemetry/instrumentation-nestjs-core';

import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

// กำหนด URL ของ OpenTelemetry Collector (Trace Receiver)
const traceCollectorEndpoint =
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
  'http://localhost:4318/v1/traces';

// สำหรับ Metrics (ยังส่งตรงไป Prometheus ก็ได้ หรือส่งผ่าน Collector ก็ได้)
// ถ้าส่งผ่าน Collector ต้องใช้ OTLPMetricExporter
const metricCollectorEndpoint =
  process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
  'http://localhost:4318/v1/metrics';

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'nest-otel-api-service',
  'service.version': process.env.npm_package_version || 'unknown',
  'service.instance.id': process.env.HOSTNAME || 'unknown-instance',
  'service.namespace': process.env.NAMESPACE || 'default',
  'service.environment': process.env.NODE_ENV || 'development',
  'service.host.name': process.env.HOSTNAME || 'localhost',
  'service.host.id': process.env.HOST_ID || 'unknown-host',
  'service.host.architecture': process.arch || 'unknown-arch',
  'service.host.os': process.platform || 'unknown-os',
  'service.host.os.version': process.version || 'unknown-version',
  'service.host.os.description': process.platform + ' ' + process.version,
  'service.host.os.name': process.platform || 'unknown-os',
  'service.host.os.type': process.platform || 'unknown-type',
  'service.host.os.family': process.platform || 'unknown-family',
  'service.host.os.kernel.name': process.platform || 'unknown-kernel',
  'service.host.os.kernel.version': process.version || 'unknown-kernel-version',
  'service.host.os.kernel.architecture': process.arch || 'unknown-kernel-arch',
});

// const provider = new NodeTracerProvider();
// provider.register();
// registerInstrumentations({
//   instrumentations: [new NestInstrumentation()],
// });

const otelSDK = new NodeSDK({
  resource: resource,
  // สำหรับ Metrics: ถ้าต้องการให้ Collector จัดการ Metrics ด้วย
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: metricCollectorEndpoint, // ส่ง Metrics ไปที่ Collector
    }),
    exportIntervalMillis: 5000, // ส่งทุก 5 วินาที
  }),

  // สำหรับ Traces: ส่ง Traces ไปที่ Collector
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: traceCollectorEndpoint,
    }),
  ),
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [
      new JaegerPropagator(),
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
      new B3Propagator(),
      new B3Propagator({
        injectEncoding: B3InjectEncoding.MULTI_HEADER,
      }),
    ],
  }),
  // instrumentations: [
  //   getNodeAutoInstrumentations({
  //     '@opentelemetry/instrumentation-nestjs-core': {
  //       // ปรับแต่ง NestJS instrumentation ถ้าต้องการ
  //       enabled: true,
  //     },
  //   }),
  // ], // auto-instrumentations

  instrumentations: [
    new HttpInstrumentation({
      // Options สำหรับ HTTP/HTTPS requests
      // ... (options อื่นๆ ตามที่คุณต้องการ)
      enabled: true,
    }),
    new ExpressInstrumentation({
      // Options สำหรับ ExpressInstrumentation
      // ... (options อื่นๆ ของ ExpressInstrumentation)
      enabled: true,
      ignoreLayers: ['NestMiddleware', 'NestInterceptor', 'NestGuard'],
    }),
    new NestInstrumentation({
      // Options สำหรับ NestJS
      // ... (options อื่นๆ ตามที่คุณต้องการ)
      enabled: true,
    }),
    // หากมี instrumentations อื่นๆ ที่คุณต้องการใช้ ก็เพิ่มที่นี่
  ],
});

export default otelSDK;

process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
