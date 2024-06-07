import { IsNotEmpty, IsNumber } from "class-validator";
import { EventName, LiveEventRequestInput } from "@localmessageprocessor/interfaces";

export class CreateLiveEventRequest implements LiveEventRequestInput {
    
    @IsNotEmpty()  
    userId: string;

    @IsNotEmpty()
    name: EventName;

    @IsNumber()
    value: number;
}