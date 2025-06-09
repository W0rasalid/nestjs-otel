import { Module } from '@nestjs/common';
import { utilities, WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import LokiTransport from 'winston-loki';
import { trace, context } from '@opentelemetry/api';

// Custom format function เพื่อดึง traceId และ spanId
const getTraceId = () => {
  const span = trace.getSpan(context.active());
  return span?.spanContext().traceId ?? 'no-trace';
};

@Module({
  imports: [
    WinstonModule.forRoot({
      // options
      transports: [
        new LokiTransport({
          host: 'http://localhost:3100',
          //host: "http://host.docker.internal:3100",
          labels: {
            app: 'nestjs-otel',
            environment: 'test',
            library: 'winston',
          },

          interval: 5,
          json: true,
          //   format: format.json(),
          // format: format.combine(
          //   format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          //   format.json(),
          // ),
          format: format.combine(
            format((info) => {
              info.labels = {
                ...(typeof info.labels === 'object' && info.labels !== null
                  ? info.labels
                  : {}),
                traceId: getTraceId(),
              };
              return info;
            })(),
            format.json(),
          ),
          onConnectionError: (err) => console.error('sss' + err),
        }),

        new transports.Console({
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.colorize(),
            format.printf(
              (info) =>
                `[${info.level}]: ${info.timestamp}  ${info.message} ${
                  info.stack || ''
                }`,
            ),
            utilities.format.nestLike('log-winston-service', {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            }),
          ),
        }),

        new transports.File({
          filename: 'application.log',
          level: 'info',
          //   dirname: 'logs',
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.json(),
            format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}`,
            ),
          ),
        }),
      ],
    }),
  ],
})
export class WinstonLoggingModule {}
