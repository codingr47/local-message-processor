import { LiveEventRequestInput, LiveEventRequestOutput, UserEventRequestInput, UserEventRequestOutput } from '@localmessageprocessor/interfaces';
import { Injectable } from '@nestjs/common';
import { FileSystemService } from './fs.service';

@Injectable()
export class AppService {
  constructor(private fsService: FileSystemService) {}

  insertLiveEvent(event: LiveEventRequestInput): Promise<LiveEventRequestOutput> { 
    return this.fsService.writeObject(event).then(() => ({}));
  }

  getUserEvent({ userId }: UserEventRequestInput): Promise<UserEventRequestOutput> {
    return Promise.resolve({ revenue: 0 });
  } 

}