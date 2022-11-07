// DB Connector 
export interface DBConnectorInterface {
    init(): Promise<void>
    readData(dsid: string, searchQuerry?: DBSearch): Promise<any>
    writeData(data: any): Promise<void>
    close(): Promise<void>
}

export type DBEntry = {
    value: any,
    dsid: string,
    timestamp: Date,
    tags?: { name: string, value: string }[]
}

export type DBSearch = {
    start?: Date,
    end?: Date,
    points?: number
}

export enum DBType {
    Influx = 'influx',
    Csv = 'csv',
    // SQLite = 'sqlite',
    // MongoDB = 'mongodb',
    // MySQL = 'mysql',
    // MSSQL = 'mssql',
    // Oracle = 'oracle',
    // Cassandra = 'cassandra',
    // Redis = 'redis',
    // CockroachDB = 'cockroachdb',
    // Sqlite = 'sqlite',
    // Sqljs = 'sqljs',
    // Mongodb = 'mongodb',
    // Mysql = 'mysql',
    // Mariadb = 'mariadb',
    // Postgres = 'postgres',
}
