import { Secret } from "jsonwebtoken";

declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            PORT: number;
            NODE_ENV: "development" | "production";
            DBURL: string;
            SQLDB_URL: string;
            DB_USER: string;
            DB_PWD: string;
            DB_NAME: string;
            DB_SERVER: string;
            DB_PORT: number;
            ACCESS_TOKEN_SECRET: Secret;
            REFRESH_TOKEN_SECRET: Secret;
            CLIENT_URL: string;
            DEFAULT_PASSWORD: string;
            MAILING_SERVICE_CLIENT_ID: string;
            MAILING_SERVICE_CLIENT_SECRET: string;
            MAILING_SERVICE_REFRESH_TOKEN: string;
            MAILING_SERVICE_ADDRESS: string;
            WORKINGDAY_SATURDAY: string;
        }
    }
}
// declare namespace NodeJS {
//     export interface ProcessEnv {
//         PORT: number;
//         NODE_ENV: "development" | "production";
//         DBURL: string;
//         SQLDB_URL: string;
//         DB_USER: string;
//         DB_PWD: string;
//         DB_NAME: string;
//         DB_SERVER: string;
//         DB_PORT: number;
//         ACCESS_TOKEN_SECRET: Secret;
//         REFRESH_TOKEN_SECRET: Secret;
//         CLIENT_URL: string;
//         DEFAULT_PASSWORD: string;
//         MAILING_SERVICE_CLIENT_ID: string;
//         MAILING_SERVICE_CLIENT_SECRET: string;
//         MAILING_SERVICE_REFRESH_TOKEN: string;
//         MAILING_SERVICE_ADDRESS: string;
//         WORKINGDAY_SATURDAY: string;
//     }
// }

declare interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

declare interface ClientToServerEvents {
    hello: () => void;
}

declare interface InterServerEvents {
    ping: () => void;
}

declare interface SocketData {
    name: string;
    age: number;
}
