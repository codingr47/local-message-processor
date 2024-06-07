import { Controller, Get, Body, Param, UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from "@nestjs/common";
import { AppService } from './app.service';
import { Post } from '@nestjs/common';
import { UserEventRequestOutput, LiveEventRequestOutput } from "@localmessageprocessor/interfaces";
import { CreateLiveEventRequest } from './dto/createLiveEventRequest';
import { GetUserEventRequest } from './dto/getUserEventRequest';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/liveEvent")
  @UsePipes(new ValidationPipe({ transform: true }))
  liveEvent(@Body() event: CreateLiveEventRequest): Promise<LiveEventRequestOutput> {
    console.log(event);
    return this.appService.insertLiveEvent(event);
  }
  
  @Get("/userEvents/:userId") 
  @UsePipes(new ValidationPipe({ transform: true }))
  userEvent(@Param() params: GetUserEventRequest): Promise<UserEventRequestOutput> {
    return this.appService.getUserEvent(params)
  }
}
