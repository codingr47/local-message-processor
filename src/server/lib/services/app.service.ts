import { LiveEventRequestInput, LiveEventRequestOutput, UserEventRequestInput, UserEventRequestOutput } from '@localmessageprocessor/interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { FileSystemService } from './fs.service';
import UsersRevenue from 'lib/entities/usersRevenue.entity';

@Injectable()
export class AppService {
  constructor(private fsService: FileSystemService, @Inject("USERS_REVENUE_REPOSITORY") private usersRevenueRepository: typeof UsersRevenue) {}

  async insertLiveEvent(event: LiveEventRequestInput): Promise<LiveEventRequestOutput> { 
    await this.fsService.writeObject(event);
    return {};
  }

  getUserEvent({ userId }: UserEventRequestInput): Promise<UserEventRequestOutput> {
    return this.usersRevenueRepository.findOne({
      attributes: ["revenue"],
      where: {
        userId,
      }
    }).then(({ revenue }) => ({ revenue }));
  } 

}