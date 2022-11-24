import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appGateway: AppGateway,
  ) {}

  @Get()
  getHello(): string {
    this.appGateway.sendMessage();
    return this.appService.getHello();
  }
}
