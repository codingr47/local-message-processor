
export enum EventName {
    AddRevenue = "add_revenue",
    SubstractRevenue = "substract_revenue"
};

export interface LiveEventRequestInput {
    userId: string;
    name: EventName;
    value: number;
};

export interface LiveEventRequestOutput {};

export interface UserEventRequestInput {
    userId: string;
}

export interface UserEventRequestOutput {
    revenue: number;
}

export enum Routes {
    LiveEvent = "/liveEvent",
    UserEvents = "/userEvents/:userId"
}