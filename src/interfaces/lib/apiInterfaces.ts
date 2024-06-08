
export type EventName = "add_revenue" | "substract_revenue";


export interface LiveEventRequestInput {
    userId: string;
    name: EventName;
    value: number;
};

export interface LiveEventRequestOutput {};

export interface UserEventRequestInput {
    userId: string;
};

export interface UserEventRequestOutput {
    revenue: number;
};