import { WriteStream, createWriteStream } from "fs";
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class FileSystemService implements OnModuleInit  {
    
    private writeStream: WriteStream | undefined;

    onModuleInit() {
        
        this.writeStream = createWriteStream(process.env.EVENTS_FILE, { flags: "a" });
    }

    public writeObject(obj: Record<string, any>): Promise<void> {
        return new Promise((resolve, reject) => { 
            this.writeStream.write(JSON.stringify(obj) + "\n", (err) => { 
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
     
    }
}