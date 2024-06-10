import { Controller, Get, Body, Param, UsePipes } from '@nestjs/common/decorators';
import { ValidationPipe } from "@nestjs/common";
import { AppService } from '../services/app.service';
import { Post } from '@nestjs/common';
import { UserEventRequestOutput, LiveEventRequestOutput, QueueModeOutput } from "@localmessageprocessor/interfaces";
import { CreateLiveEventRequest } from './dto/createLiveEventRequest';
import { GetUserEventRequest } from './dto/getUserEventRequest';
import { Routes } from '../enums';

/**
 * This controller holds the public interface and type validation definitions
 * of two routes
 * POST /liveEvent - inserts a new live event
 * GET /userEvents/:userId - gets the total revenue of a user, fetched by userId(string) 
 */
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
