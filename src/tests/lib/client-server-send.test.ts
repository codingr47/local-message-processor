import { spawn } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import throttledQueue from "throttled-queue";
import path from "path";
import messagesApi from "@localmessageprocessor/client";
import { check as checkPort } from "tcp-port-used";
import { EventName } from "@localmessageprocessor/interfaces";

jest.setTimeout(9999999)


const sleep = (ms: number) =>  {
    return new Promise<void>((res) => {
        setTimeout(() => { res(); }, ms);
    });
}

const NUMBER_OF_EVENTS_TO_SEND = 30000;
describe("Load test", () => { 
    it("Will make sure that all events reached the events file", async() => { 
        spawn("npm", ["run", "server:dev"], { cwd: path.resolve(__dirname, "../../"), stdio: "inherit", shell: true});
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
        const throttle = throttledQueue(100, 1000);
        for (let i = 1; i<= NUMBER_OF_EVENTS_TO_SEND; i++) {
            const eventName: EventName = Math.random() >= 0.5 ? "add_revenue" : "substract_revenue";
            const userId = `user${Math.round(Math.random() * 99 + 1)}`
            const value = Math.round(Math.random() * 99 + 1); 
            promises.push(throttle( () =>  client.liveEvent({name: eventName, userId, value  })).catch((err) => (errors.push(err))));
        }
        await Promise.all(promises);
        const fileContents = readFileSync(path.resolve(__dirname, "../../../events.jsonl"), { encoding: "utf8" });
        writeFileSync(path.resolve(__dirname, "../../../errors.log"), JSON.stringify(errors), { encoding: "utf8" });
        expect(fileContents.split("\n").length).toBe(NUMBER_OF_EVENTS_TO_SEND + 1);

    });
});