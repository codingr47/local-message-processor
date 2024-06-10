import { LiveEventRequestInput, LiveEventRequestOutput, UserEventRequestInput, UserEventRequestOutput } from '@localmessageprocessor/interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { FileSystemService } from './fs.service';
import UsersRevenue from "../entities/usersRevenue.entity";
import { USERS_REVENUE_REPOSITORY } from '../consts';

/**
 * The main application's service class
 */
@Injectable()
export class AppService {
  constructor(private fsService: FileSystemService, @Inject(USERS_REVENUE_REPOSITORY) private usersRevenueRepository: typeof UsersRevenue) {}

  private isEventsFileBusy = false; 

  private queuedMessages: LiveEventRequestInput[] = [];

  /**
   * An asynchronous method which digests data into the events file.
   * if the file is currently busy with  processing by another process, it will insert the events into a in memory queue array
   * @param {LiveEventInput} event an object representing a user "transaction" 
   * @returns {Promise<LiveEventRequestOutput>} returns a promise
   */
  public async insertLiveEvent(event: LiveEventRequestInput): Promise<LiveEventRequestOutput> { 
    if (this.isEventsFileBusy) {
      this.queuedMessages.push(event);
    } else {
      await this.fsService.writeObject(event);
    }
    return {};
  }
  /**
   * a method querying the db to get a user's revenue, with regards to his' user id.
   * @param {UserEventRequestInput} req requested userId 
   * @returns {Promise<UserEventRequestOutput>} the user's revenue
   */
  public getUserEvent({ userId }: UserEventRequestInput): Promise<UserEventRequestOutput> {
    return this.usersRevenueRepository.findOne({
      attributes: ["revenue"],
      where: {
        userId,
      }
    }).then(({ revenue }) => ({ revenue }));
  } 

  /**
   * an async method which sets the events file resource as busy / free
   * when setting the resource free after it was alrady busy, the method will flush the items in the queue 
   * ingo the normal processing pipeline and then empty it.
   * @param {boolean} isQueueMode a boolean. if true, 
   */
  public async setEventsFileBusy(isQueueMode: boolean) {
    if (!isQueueMode && this.isEventsFileBusy) {
      this.isEventsFileBusy = isQueueMode;
      await Promise.all(this.queuedMessages.map((message) => this.insertLiveEvent(message)));
      this.queuedMessages = [];
    }
    this.isEventsFileBusy = isQueueMode;
    
  } 

}