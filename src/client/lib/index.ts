import axios from "axios"
import { 
    LiveEventRequestInput,
    LiveEventRequestOutput,
    UserEventRequestInput,
    UserEventRequestOutput,
} from "@localmessageprocessor/interfaces";
import { AxiosResponse } from "axios";

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
    });
    return {
        liveEvent(input: LiveEventRequestInput): Promise<AxiosResponse<LiveEventRequestOutput>> {
            return client.post<LiveEventRequestInput, AxiosResponse<LiveEventRequestOutput>>(Routes.LiveEvent, input);
        },
        userEvents(input: UserEventRequestInput): Promise<AxiosResponse<UserEventRequestOutput>> {
            const route = Routes.UserEvents.replace(":userId", input.userId);
            return client.get<UserEventRequestInput, AxiosResponse<UserEventRequestOutput>>(route);
        }
    }
}