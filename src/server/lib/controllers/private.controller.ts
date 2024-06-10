import { Controller, Get, Body, Param, UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from "@nestjs/common";
import { AppService } from '../services/app.service';
import { Post } from '@nestjs/common';
import { QueueModeRequest } from './dto/queueModeRequest';
import { QueueModeOutput } from '@localmessageprocessor/interfaces';

@Controller("/private")
export class PrivateController {
  constructor(private readonly appService: AppService) {}


  @Post("/queueMode")
  @UsePipes(new ValidationPipe({ transform: true }))
  queueMode(@Body() event: QueueModeRequest): Promise<QueueModeOutput> {
    this.appService.setProcessingMode(event.queueMode);
    return Promise.resolve({});
  }
}
