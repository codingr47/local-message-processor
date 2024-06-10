import { readFile, writeFile } from "fs-extra";
import { sleep } from "@localmessageprocessor/common";
import api from "@localmessageprocessor/client";
import { Sequelize } from "sequelize-typescript";
import "dotenv/config";
import yargs from "yargs";
import { getEventsFromRawContent, getRevenuesArray, getUpsertQuery } from "./utils";
import { SLEEP_MS } from "./consts";



const sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


const forever = async (cb: () => Promise<void>) => {
    while (true) {
        await cb();
        await sleep(SLEEP_MS);
    }
}

(async() => {
    const args =  
    await yargs(process.argv)
        .option("forever", {
            demandOption: false,
            type: "boolean",
        })
        .option("serverUrl", {
            demandOption: false,
            type: "string",
        })
        .option("eventsFilePath", {
            demandOption: false,
            type: "string",
        })
        .parse();
    const client = api(args.serverUrl || "http://localhost:8000", process.env.AUTH_SECRET);
    //The main function is the body of the processing of events.
    //Each event will be saved into the db.
    const main = async () => {
        //notify the server that processing is about to happen
        await client.queueMode({ queueMode: true });
        const eventsFilePath = process.env.EVENTS_FILE;
        const eventsContent = await readFile(args.eventsFilePath || eventsFilePath, { encoding: "utf-8" });
        if (0 < eventsContent.length ) {
            const events = getEventsFromRawContent(eventsContent);
            const revenuesArray = getRevenuesArray(events);
            await Promise.all(revenuesArray.map(([userId, revenue]) => { 
                return sequelize.query(getUpsertQuery(userId, revenue));
            }));
            await writeFile(eventsFilePath,"", { encoding: "utf-8" });
        }
        //notify the server that processing has been done
        await client.queueMode({ queueMode: false });
    }
    
    if (args.forever) {
        await forever(main);
    } else {
        await main();
    }
    
})();