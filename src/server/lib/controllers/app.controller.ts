import { Controller, Get, Body, Param, UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from "@nestjs/common";
import { AppService } from '../services/app.service';
import { Post } from '@nestjs/common';
import { UserEventRequestOutput, LiveEventRequestOutput } from "@localmessageprocessor/interfaces";
import { CreateLiveEventRequest } from './dto/createLiveEventRequest';
import { GetUserEventRequest } from './dto/getUserEventRequest';

enum Routes {
  LiveEvent = "/liveEvent",
  UserEvents = "/userEvents/:userId",
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post(Routes.LiveEvent)
  @UsePipes(new ValidationPipe({ transform: true }))
  liveEvent(@Body() event: CreateLiveEventRequest): Promise<LiveEventRequestOutput> {
    return this.appService.insertLiveEvent(event);
  }
  
  @Get(Routes.UserEvents) 
  @UsePipes(new ValidationPipe({ transform: true }))
  userEvent(@Param() params: GetUserEventRequest): Promise<UserEventRequestOutput> {
    return this.appService.getUserEvent(params)
  }
}
