import { WriteStream, createWriteStream } from "fs";
import { Injectable, OnModuleInit } from "@nestjs/common";

/**
 * a service class in charge of writing event objects into a file using a stream.
 */
@Injectable()
export class FileSystemService implements OnModuleInit  {

    private writeStream: WriteStream | undefined

    onModuleInit() {    
        this.writeStream = createWriteStream(process.env.EVENTS_FILE, { flags: "a" });
    }


    public writeObject(obj: Record<string, any>): Promise<void> {
        return new Promise((resolve, reject) => { 
            this.writeStream.write(JSON.stringify(obj) + "\n", (err) => { 
                if(err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}