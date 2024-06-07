
export enum EventName {
    AddRevenue = "add_revenue",
    SubstractRevenue = "substract_revenue"
};

export type LiveEventRequestInput = {
    userId: string;
    name: EventName;
    value: number;
};

export type LiveEventRequestOutput = {};