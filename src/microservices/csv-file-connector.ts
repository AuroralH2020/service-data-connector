/**
* Interface to interact with CSV file
* @interface
*/ 
import * as fs from 'fs'

import { Config } from '../config'
import { logger } from '../utils'
import { DBEntry, DBSearch, DBConnectorInterface } from '../types/db-connector-types'

export class CsvFileConnector implements DBConnectorInterface {
    private fileStream: any
    constructor() {
        logger.debug('CSV file connector')
    }
    // Public methods
    public async init(): Promise<void> {
        if (!fs.existsSync(Config.CSV_FILE.OUTPUT)) {
            logger.debug('Creating file')
            const header = `dsid${Config.CSV_FILE.DELIMITER}timestamp${Config.CSV_FILE.DELIMITER}value\n` 
            fs.writeFileSync(Config.CSV_FILE.OUTPUT, header)
        } else {
            logger.debug('File already exists')
        }
        this.fileStream = fs.createWriteStream(Config.CSV_FILE.OUTPUT,{ flags: 'a+' })

        logger.info('File initialized')
    }
    // TBD: extend with from: to: timestamp? 
    public async readData(dsid: string, searchQuerry: DBSearch): Promise<{ value: any, timestamp: Date }[]> {
        logger.debug('readData ')
        try {
            // TBD reading 
            return [{ value: 1, timestamp: new Date() }]
        } catch (e) {
            logger.error('Error reading data')
            throw e
        }
    }

    public async close(): Promise<void> {
        logger.debug('CSV file closed')
    }
    public async writeData(toStore: DBEntry): Promise<void> {
        logger.debug('writing data to csv file')
        const line = toStore.dsid + Config.CSV_FILE.DELIMITER + toStore.timestamp.toISOString() + Config.CSV_FILE.DELIMITER + toStore.value + '\n'
        this.fileStream.write(line)
       // TBD TAGS
    }
}
// private functions

// Singleton instance
export const dbConnector = new CsvFileConnector()
