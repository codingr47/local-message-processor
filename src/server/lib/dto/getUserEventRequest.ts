import { IsNotEmpty } from "class-validator";
import { UserEventRequestInput } from "@localmessageprocessor/interfaces";

export class GetUserEventRequest implements UserEventRequestInput {
    
    @IsNotEmpty()  
    userId: string;
}