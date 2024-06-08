import axios from "axios"
import { 
    LiveEventRequestInput,
    LiveEventRequestOutput,
    UserEventRequestInput,
    UserEventRequestOutput,
    Routes,
} from "@localmessageprocessor/interfaces";


export default function eventsApi(baseUrl: string, token: string) {   
    const client = axios.create({
        baseURL: baseUrl,
        headers: {
            Authorization: token,
        },
    })
    return {
        liveEvent(input: LiveEventRequestInput): Promise<LiveEventRequestOutput> {
            return client.post<LiveEventRequestInput, LiveEventRequestOutput>(Routes.LiveEvent, input);
        },
        userEvents(input: UserEventRequestInput): Promise<UserEventRequestOutput> {
            const route = Routes.UserEvents.replace(":userId", input.userId);
            return client.get<UserEventRequestInput, UserEventRequestOutput>(route);
        }
    }
}