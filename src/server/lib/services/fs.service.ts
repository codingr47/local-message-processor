import { WriteStream, createWriteStream } from "fs";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { check, lock } from "proper-lockfile";

@Injectable()
export class FileSystemService implements OnModuleInit  {
    
    private counter: number = 1;

    private writeStream: WriteStream | undefined;

    onModuleInit() {
        
        this.writeStream = createWriteStream(process.env.EVENTS_FILE, { flags: "a" });
    }

    private async executeAfterResourceIsFree(cb: () => Promise<void>): Promise<void> {
        try {
            while (!(await check(process.env.EVENTS_FILE))) {
            
                    const releae = await lock(process.env.EVENTS_FILE);
                    const res = await cb();
                    await releae();
                    return res;
                
            }
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