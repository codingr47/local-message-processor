import { spawn } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import throttledQueue from "throttled-queue";
import path from "path";
import messagesApi from "@localmessageprocessor/client";
import { check as checkPort } from "tcp-port-used";
import { unlink, exists } from "fs-extra";
import { EventName } from "@localmessageprocessor/interfaces";

jest.setTimeout(9999999)


const sleep = (ms: number) =>  {
    return new Promise<void>((res) => {
        setTimeout(() => { res(); }, ms);
    });
}

const NUMBER_OF_EVENTS_TO_SEND = 5000;
describe("Load test", () => { 
    it("Will make sure that all users were properly updated in the db after process", async() => { 
        const EVENTS_PATH = path.resolve(__dirname, "../../../events.jsonl");
        const ERRORS_LOG_PATH = path.resolve(__dirname, "../../../errors.log");
        if (await exists(EVENTS_PATH)) {
            await unlink(EVENTS_PATH);
        } 
        if (await exists(ERRORS_LOG_PATH)) {
            await unlink(ERRORS_LOG_PATH);
        }
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
        spawn("npm", ["run", "process:dev-forever"], { cwd: path.resolve(__dirname, "../../"), stdio: "inherit", shell: true});
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
        writeFileSync(ERRORS_LOG_PATH, JSON.stringify(errors), { encoding: "utf8" });

        childProcessServer.kill();
        await sleep(5000);
        const arrayOfExpectedUsers = Array.from(expectedUserValues)
        for ( const [userId, transactions] of arrayOfExpectedUsers) {
            const { data: { revenue: actualUserRevenue } } = await client.userEvents({ userId });
            const sumOfTransactions = transactions.reduce((accumulator, currentTransaction) => accumulator + currentTransaction, 0);
            expect(actualUserRevenue).toBe(sumOfTransactions); 
        }

    });
});