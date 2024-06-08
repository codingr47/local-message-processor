import messagesApi from "@localmessageprocessor/client";
import { EventName } from "@localmessageprocessor/interfaces";

(async () => {
    const client = messagesApi("http://localhost:8000", "secret");
    const eventName: EventName = Math.random() >= 0.5 ? "add_revenue" : "substract_revenue";
    const userId = `user${Math.round(Math.random() * 99 + 1)}`
    const value = Math.round(Math.random() * 99 + 1); 
    const d = await client.liveEvent({name: eventName, userId, value  })
    console.log(d.status);
    
})();