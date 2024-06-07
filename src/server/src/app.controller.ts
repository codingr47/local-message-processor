import { Controller, Get, Body, Param } from '@nestjs/common/decorators';
import { AppService } from './app.service';
import { Post } from '@nestjs/common';
import { UserEventRequestOutput, LiveEventRequestOutput } from "@localmessageprocessor/interfaces";
import { CreateLiveEventRequest } from './dto/createLiveEventRequest';
import { GetUserEventRequest } from './dto/getUserEventRequest';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/liveEvent")
  liveEvent(@Body() event: CreateLiveEventRequest): Promise<LiveEventRequestOutput> {
    return this.appService.insertLiveEvent(event);
  }

  @Get("/userEvents/:userId") 
  userEvent(@Param() params: GetUserEventRequest): Promise<UserEventRequestOutput> {
    return this.appService.getUserEvent(params)
  }
}
