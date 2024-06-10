import { EventName, LiveEventRequestInput } from "@localmessageprocessor/interfaces";

/**
 * returns an sql query which upserts a user revenue row in the UsersRevenues table
 * @param {string} userId a userId
 * @param {number} revenue a number representing the calculated revenue from various transactions  
 * @returns 
 */
export const getUpsertQuery = (userId: string, revenue: number) => {
    return `INSERT INTO "public"."UsersRevenues" ("userId", "revenue", "createdAt", "updatedAt")
    VALUES ('${userId}', ${revenue}, NOW(), NOW())
    ON CONFLICT ("userId")
    DO UPDATE SET revenue = "UsersRevenues".revenue + excluded.revenue;`
}

/**
 * The function transforms an entire jsonl file into an array of objects and returns it
 * @param contents a jsonl file contetns
 * @returns {LiveEventRequestInput[]} an array of events
 */
export function getEventsFromRawContent(contents: string ): LiveEventRequestInput[] {
    const events: LiveEventRequestInput[] = [];
    const data = contents.split("\n");
    for (const dataChunk of data) {
        try {
            events.push(JSON.parse(dataChunk));
        } catch (err) {
            //do nothing
        }
    }
    return events;
}

/**
 * calculates an overall revenue of each user present in the provided data array
 * returns a new array of revenues for each user 
 * @param events an array of events
 * @returns {[string, number][]} an array of tupled userId and revenue.
 */
export const getRevenuesArray = (events: LiveEventRequestInput[]): [string, number][]=> { 
    const map = new Map<string, number>();
    const getValueWithSign = (name: EventName, value: number) : number => { 
        if ("add_revenue" === name) { 
            return Math.abs(value);
        } else {
            return Math.abs(value) * -1; 
        }
    }
    events.forEach(({ userId, name, value  }) => {
            map.set(userId, (map.get(userId) || 0) + getValueWithSign(name, value));
    });
    return Array.from(map);
}
