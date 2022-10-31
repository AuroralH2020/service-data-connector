import { InfluxConnector } from '../microservices/influx-connector'

import { Config } from '../config';
import { DBConnectorInterface, DBSearch, DBType } from '../types/db-connector-types'

export class DBConnector implements DBConnectorInterface {
    // Singleton
    private static instance: DBConnector
    private db: DBConnectorInterface | undefined
    public static getInstance(): DBConnector {
        if (!DBConnector.instance) {
            DBConnector.instance = new DBConnector()
        }
        return DBConnector.instance
    }
    async init(): Promise<void> {
        switch (Config.DB_TYPE) {
            case DBType.Influx:
                this.db = new InfluxConnector()
                break
            default:
                throw new Error('DB_TYPE not supported')
        }
        await this.db!.init()
    }
    async readData(dsid: string, searchQuerry?: DBSearch | undefined): Promise<any> {
       if (!this.db) {
              throw new Error('DB not initialized')
       }
       return this.db.readData(dsid, searchQuerry)
    }
    async writeData(data: any): Promise<void> {
        if (!this.db) {
            throw new Error('DB not initialized')
        }
       return this.db.writeData(data)
    }
    async close(): Promise<void> {
        if (this.db) {
            this.db.close()
        }
    }
}
export const dbConnector = DBConnector.getInstance()

