import axios from "axios"
import axiosRetry from "axios-retry";
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
    axiosRetry(client, { retries: 10, retryDelay: (retryCount) => {
        return retryCount * 1000;
    }});
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