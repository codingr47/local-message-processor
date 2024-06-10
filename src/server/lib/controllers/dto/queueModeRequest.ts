import { IsBoolean, IsNotEmpty } from "class-validator";
import { QueueModeInput } from "@localmessageprocessor/interfaces";

export class QueueModeRequest implements QueueModeInput {
    
    @IsNotEmpty()  
    @IsBoolean()
    queueMode: boolean;

}