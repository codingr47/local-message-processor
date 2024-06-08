import { LiveEventRequestInput, LiveEventRequestOutput, UserEventRequestInput, UserEventRequestOutput } from '@localmessageprocessor/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  insertLiveEvent({ name, userId, value }: LiveEventRequestInput): Promise<LiveEventRequestOutput> {
    return Promise.resolve({});
  }

  getUserEvent({ userId }: UserEventRequestInput): Promise<UserEventRequestOutput> {
    return Promise.resolve({ revenue: 0 });
  } 

}