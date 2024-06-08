import { createReadStream, ReadStream } from "fs";
import { readFile, writeFile } from "fs-extra";
import { LiveEventRequestInput, EventName } from "@localmessageprocessor/interfaces";
import { Sequelize } from "sequelize-typescript";
import "dotenv/config";
import yargs from "yargs";

const SLEEP_MS = 500;

const sleep = (ms: number) =>  {
    return new Promise<void>((res) => {
        setTimeout(() => { res(); }, ms);
    });
}

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

export async function processMessages(stream: ReadStream ): Promise<{ events: LiveEventRequestInput[ ]; charactersRead:number; }> {
    let partialMessage = "";
    let charactersRead = 0;
    let messagesQueue: LiveEventRequestInput[] = [];
    return new Promise((res) => { 
        stream.setEncoding("utf-8")
        .on("data", (chunk: string) => {
            charactersRead += chunk.length; 
            const data = chunk.split("\n");
            for (const dataChunk of data) {
                try {
                    messagesQueue.push(JSON.parse(dataChunk));
                } catch (err) {
                    if (!partialMessage) {
                        partialMessage = dataChunk;
                    } else {
                        partialMessage += dataChunk;
                        messagesQueue.push(JSON.parse(partialMessage));
                        partialMessage = "";
                    }
                }
            }
        })
        .on("end", () => { 
          res({ events: messagesQueue, charactersRead });  
        })
        
    });
   
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
        const eventsFilePath = process.env.EVENTS_FILE;
        const stream = createReadStream(eventsFilePath);
        const { events, charactersRead } = await processMessages(stream);
        const revenuesArray = await getRevenuesArray(events);
        await Promise.all(revenuesArray.map(([userId, revenue]) => { 
            sequelize.query(getUpsertQuery(userId, revenue));
        }));
        const fileContents = await readFile(eventsFilePath, { encoding: "utf-8" });
        await writeFile(eventsFilePath, fileContents.substring(charactersRead), { encoding: "utf-8" });
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