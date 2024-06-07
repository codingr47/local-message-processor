import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Post } from '@nestjs/common';
import { LiveEventRequestInput, LiveEventRequestOutput } from "@localmessageprocessor/interfaces";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  liveEvent(event: LiveEventRequestInput): LiveEventRequestOutput {
    return this.appService.getHello();
  }
}
