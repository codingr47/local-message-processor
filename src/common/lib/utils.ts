import { Sequelize } from "sequelize-typescript";

export function sleep(ms: number): Promise<void> {
    return new Promise<void>((res) => {
        setTimeout(() => { res(); }, ms)
    });
}

export function getPostgresSequelize(host:string, username: string, password: string, database: string, port = 5432) {
    return new Sequelize({
        dialect: "postgres",
        host,
        port,
        username,
        password,
        database,
    });
}
