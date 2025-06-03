export interface IOpenTelemetryConfig {
  metrics: IMetricShcema;
}

interface IMetricShcema {
  hostMetrics: boolean;
  apiMetrics: IApiMetrics;
}

interface IApiMetrics {
  enable: boolean;
  defaultAttributes: {
    custom: string;
  };
  ignoreRoutes: string[];
  ignoreUndefinedRoutes: boolean;
  prefix: string;
}
