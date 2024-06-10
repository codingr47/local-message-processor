import { WriteStream, createWriteStream, createReadStream, ReadStream } from "fs";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ensureFile, watch } from "fs-extra";

function sleep(ms: number): Promise<void> {
    return new Promise<void>((res) => {
        setTimeout(() => { res(); }, ms)
    });
}

const WAIT_FOR_RESOURCE_MS = 50;

@Injectable()
export class FileSystemService implements OnModuleInit  {
    
    private counter: number = 1;

    private writeStream: WriteStream | undefined;

    private readStream: ReadStream | undefined;

    private isResourceLocked: boolean = false;


    onModuleInit() {    
        this.writeStream = createWriteStream(process.env.EVENTS_FILE, { flags: "a" });
        ensureFile(process.env.LOCK_FILE).then(() => {
            watch(process.env.LOCK_FILE, () =>  {
                this.readStream = createReadStream(process.env.LOCK_FILE, { encoding: "utf-8" });
                this.readStream.on("data", (d) => { 
                    console.log("Read Stream got data", d);
                    if (d.toString().trim() === "1") {
                        this.isResourceLocked = true;
                    } else if (d.toString().trim() === "0") {
                        this.isResourceLocked = false;
                    }
                });
            });
        });
        
    }

    private async waitForResource(): Promise<void> { 
        while(this.isResourceLocked) {
            console.log("resource is locked...");
            await sleep(WAIT_FOR_RESOURCE_MS);
        }
        
    }

    private async executeAfterResourceIsFree(cb: () => Promise<void>): Promise<void> {
        try {
            await this.waitForResource();
            const res = await cb();
            return res;
        } catch (err) {
            return this.executeAfterResourceIsFree(cb);
        }
    }


    public writeObject(obj: Record<string, any>): Promise<void> {
        return this.executeAfterResourceIsFree(() => { 
            return new Promise((resolve, reject) => { 
                console.log(`Writing To Events File ! ${this.counter}`);
                this.counter++;
                this.writeStream.write(JSON.stringify(obj) + "\n", (err) => { 
                    if(err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
     
    }
}