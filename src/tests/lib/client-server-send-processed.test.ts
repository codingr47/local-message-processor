import { spawn } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import throttledQueue from "throttled-queue";
import path from "path";
import messagesApi from "@localmessageprocessor/client";
import { check as checkPort } from "tcp-port-used";
import { unlink, exists } from "fs-extra";
import { EventName } from "@localmessageprocessor/interfaces";
import { getPostgresSequelize } from "@localmessageprocessor/common"

jest.setTimeout(9999999)


const sleep = (ms: number) =>  {
    return new Promise<void>((res) => {
        setTimeout(() => { res(); }, ms);
    });
}

const NUMBER_OF_EVENTS_TO_SEND = 5000;
describe("Load test", () => { 
    it("Will make sure that all users were properly updated in the db after process", async() => { 
        const sequelize = getPostgresSequelize(
            process.env.DB_HOST,
            process.env.DB_USERNAME,
            process.env.DB_PASSWORD,
            process.env.DB_NAME
        );
        await sequelize.query(`DELETE FROM public."UsersRevenues"`);
        const EVENTS_PATH = path.resolve(__dirname, process.env.EVENTS_FILE);
        const ERRORS_LOG_PATH = path.resolve(__dirname, "../../../errors.log");
        [EVENTS_PATH, ERRORS_LOG_PATH].map((p) => exists(p).then( (doesExist) => { if (doesExist) { return unlink(p) } })); 
        const childProcessServer = spawn("npm", ["run", "server:dev"], { cwd: path.resolve(__dirname, "../../"), stdio: "inherit", shell: true});
        const client = messagesApi("http://localhost:8000", "secret");
        const promises: Promise<any>[] = [];
        let portAvailable = false;
        while (!portAvailable) {
            await sleep(50);
            portAvailable = await checkPort(8000, "0.0.0.0").catch(() => false);
        }
        await sleep(5000);
        console.log("Starting load test !");
        const errors: Error[] = [];
        const throttle = throttledQueue(1000, 1000);
        const expectedUserValues = new Map<string, number[]>();
        for (let i = 1; i<= NUMBER_OF_EVENTS_TO_SEND; i++) {
            const eventName: EventName = Math.random() >= 0.5 ? "add_revenue" : "substract_revenue";
            const userId = `user${Math.round(Math.random() * 99 + 1)}`
            const value = Math.round(Math.random() * 99 + 1); 
            expectedUserValues.set(userId, expectedUserValues.get(userId) ?  [...expectedUserValues.get(userId), "add_revenue" === eventName ?  value : -1 * value] : ["add_revenue" === eventName ? value : -1 * value]);
            promises.push(throttle( () =>  client.liveEvent({name: eventName, userId, value  })).catch((err) => (errors.push(err))));
        }
        await Promise.all(promises);
        const fileContents = readFileSync(EVENTS_PATH, { encoding: "utf8" });
        writeFileSync(ERRORS_LOG_PATH, JSON.stringify(errors), { encoding: "utf8" });
        expect(fileContents.split("\n").length).toBe(NUMBER_OF_EVENTS_TO_SEND + 1);

        childProcessServer.kill();

        const processMessageProcessor = spawn("npm", ["run", "process:dev"], { cwd: path.resolve(__dirname, "../../"), stdio: "inherit", shell: true});
        await (new Promise<void>((res) => {
            processMessageProcessor.on("exit", () => res()); 
        }));
        const arrayOfExpectedUsers = Array.from(expectedUserValues)
        for ( const [userId, transactions] of arrayOfExpectedUsers) {
            const { data: { revenue: actualUserRevenue } } = await client.userEvents({ userId });
            const sumOfTransactions = transactions.reduce((accumulator, currentTransaction) => accumulator + currentTransaction, 0);
            expect(sumOfTransactions).toBe(actualUserRevenue); 
        }

    });
});