import { ReadStream } from "fs";
import { readFile, writeFile } from "fs-extra";
import { LiveEventRequestInput, EventName } from "@localmessageprocessor/interfaces";
import { sleep } from "@localmessageprocessor/common";
import { Sequelize } from "sequelize-typescript";
import "dotenv/config";
import yargs from "yargs";

let counterQueries = 0;
let counterMessages = 0;
const SLEEP_MS = 500;

const sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const getUpsertQuery = (userId: string, revenue: number) => {
    return `INSERT INTO "public"."UsersRevenues" ("userId", "revenue", "createdAt", "updatedAt")
    VALUES ('${userId}', ${revenue}, NOW(), NOW())
    ON CONFLICT ("userId")
    DO UPDATE SET revenue = excluded.revenue + (${revenue});`
}

export async function processMessages(contents: string ): Promise<{ events: LiveEventRequestInput[]; }> {
    const messagesQueue: LiveEventRequestInput[] = [];
    const data = contents.split("\n");
    console.log("amount of messages", data.length);
    for (const dataChunk of data) {
        try {
            messagesQueue.push(JSON.parse(dataChunk));
        } catch (err) {
            console.log("error with processing event", dataChunk ,err);
        }
    }
    console.log("amount of events", messagesQueue.length);
    return { events: messagesQueue };
}

const getRevenuesArray = (messages: LiveEventRequestInput[]): [string, number][]=> { 
    const map = new Map<string, number>();
    const getValueWithSign = (name: EventName, value: number) : number => { 
        if ("add_revenue" === name) { 
            return Math.abs(value);
        } else {
            return Math.abs(value) * -1; 
        }
    }
    messages.forEach(({ userId, name, value  }) => {
            map.set(userId, (map.get(userId) || 0) + getValueWithSign(name, value));
    });
    return Array.from(map);
}


const forever = async (cb: () => Promise<void>) => {
    while (true) {
        await cb();
        await sleep(SLEEP_MS);
    }
}

(async() => {
    const main = async () => {
        console.log("Locking FIle !");
        await writeFile(process.env.LOCK_FILE, "1", { encoding: "utf-8" });
        console.log("File is locked !");
        const eventsFilePath = process.env.EVENTS_FILE;
        const eventsContent = await readFile(eventsFilePath, { encoding: "utf-8" });
        if (0 < eventsContent.length ) {
            const { events } = await processMessages(eventsContent);
            const revenuesArray = await getRevenuesArray(events);
            counterQueries += revenuesArray.length;
            counterMessages += events.length;
            console.log("QUERIES PROCESSED: ", counterQueries);
            console.log("EVENTS PROCESSED: ", counterMessages);
            await Promise.all(revenuesArray.map(([userId, revenue]) => { 
                sequelize.query(getUpsertQuery(userId, revenue));
            }));
            await writeFile(eventsFilePath,"", { encoding: "utf-8" });
        }
        
        await writeFile(process.env.LOCK_FILE, "0", { encoding: "utf-8" });
        console.log("File released !");
    }
    const args =  
    await yargs(process.argv)
        .option("forever", {
            demandOption: false,
            type: "boolean",
        })
        .parse();
    if (args.forever) {
        await forever(main);
    } else {
        await main();
    }
    
})();