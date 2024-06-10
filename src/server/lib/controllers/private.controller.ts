import { Controller, Get, Body, Param, UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from "@nestjs/common";
import { AppService } from '../services/app.service';
import { Post } from '@nestjs/common';
import { QueueModeRequest } from './dto/queueModeRequest';
import { QueueModeOutput } from '@localmessageprocessor/interfaces';

/**
 * This is a private API being used by the message processor module, which is 
 * an external service, populating data into the Postgres DB
 * it holds one route POST /private/queueMode which is basically a way to tell the server
 * that messages are currently being proceesed from the events file, so the server can digest the messages 
 * in a different way until the file resource is free again
 */
@Controller("/private")
export class PrivateController {
  constructor(private readonly appService: AppService) {} 


  @Post("/queueMode")
  @UsePipes(new ValidationPipe({ transform: true }))
  queueMode(@Body() { queueMode }: QueueModeRequest): Promise<QueueModeOutput> {
    this.appService.setEventsFileBusy(queueMode);
    return Promise.resolve({});
  }
}
