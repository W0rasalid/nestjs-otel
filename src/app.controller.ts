import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { OtelCounter } from 'nestjs-otel';
import { Counter } from '@opentelemetry/api';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/home')
  home(
    @OtelCounter('app_counter_1_inc', { description: 'counter 1 description' })
    counter1: Counter,
  ) {
    counter1.add(1);
    return 'Hello from home!';
  }
}
