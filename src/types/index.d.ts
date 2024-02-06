import { Express } from "express";
import { Secret } from "jsonwebtoken";
declare global {
  namespace Express {
    export interface Request {
      user?: any;
    }
  }
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

declare class AppRouter {
  private app: Express;
  constructor(app: Express);
  public initialize(routes: RouterObject[]): void;
}
declare interface AppOptions {
  useSocketIO?: boolean;
  useMongoDB?: boolean;
}
export interface RouterObject {
  path: string;
  router: Router;
}

export interface ITokens {
  access: string;
  refresh: string;
  ip: string;
}

export type Gender = "Male" | "Female" | "Other";

export interface IOffsetTime {
  toManager: { value: string; label: string };
  cc: { value: string; label: string }[];
  fromDateTime: string;
  toDateTime: string;
  reason: string;
  makeUpTime: string;
  handler: { value: string; label: string };
  totalHours: number;
}

declare interface IHoliday {
  Id: number;
  Syntax: string;
  Note: string;
  IsHoliday: boolean;
}

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
