import { ReadStream, createWriteStream } from "fs";
import path from "path";
import { readFile, writeFile } from "fs-extra";
import { LiveEventRequestInput, EventName } from "@localmessageprocessor/interfaces";
import { sleep } from "@localmessageprocessor/common";
import api from "@localmessageprocessor/client";
import { Sequelize } from "sequelize-typescript";
import "dotenv/config";
import yargs from "yargs";

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
    DO UPDATE SET revenue = "UsersRevenues".revenue + excluded.revenue;`
}

export async function processMessages(contents: string ): Promise<{ events: LiveEventRequestInput[]; }> {
    const messagesQueue: LiveEventRequestInput[] = [];
    const data = contents.split("\n");
    for (const dataChunk of data) {
        try {
            messagesQueue.push(JSON.parse(dataChunk));
        } catch (err) {
            //do nothing
        }
    }
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
    const client = api("http://localhost:8000", process.env.AUTH_SECRET);
    const main = async () => {
        await client.queueMode({ queueMode: true });
        const eventsFilePath = process.env.EVENTS_FILE;
        const eventsContent = await readFile(eventsFilePath, { encoding: "utf-8" });
        if (0 < eventsContent.length ) {
            const { events } = await processMessages(eventsContent);
            const revenuesArray = await getRevenuesArray(events);
            await Promise.all(revenuesArray.map(([userId, revenue]) => { 
                const sql = getUpsertQuery(userId, revenue);
                //debugSqlStream.write(sql + "\n");
                return sequelize.query(getUpsertQuery(userId, revenue));
            }));
            await writeFile(eventsFilePath,"", { encoding: "utf-8" });
        }
        
        await client.queueMode({ queueMode: false });
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