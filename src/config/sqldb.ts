import sql, { config, ConnectionPool } from "mssql";

export default class SqlDB {
  private config: config;
  constructor(config: config) {
    this.config = config;
  }

  public async connect(): Promise<ConnectionPool | unknown> {
    try {
      const pool = new sql.ConnectionPool(this.config);
      await pool.connect();
      console.log("Connected to sql server");
      return pool;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
