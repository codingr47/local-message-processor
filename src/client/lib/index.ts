import axios from "axios"
import { 
    LiveEventRequestInput,
    LiveEventRequestOutput,
    UserEventRequestInput,
    UserEventRequestOutput,
} from "@localmessageprocessor/interfaces";

enum Routes {
    LiveEvent = "/liveEvent",
    UserEvents = "/userEvents/:userId",
};

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