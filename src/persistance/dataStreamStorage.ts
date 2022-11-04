import * as fs from 'fs'
import { Config } from '../config'
import { HttpStatusCode, logger, MyError } from '../utils'
import { DataStream, DataStreamType } from '../core/DataStream'

export class DSStorage {
    private loaded: boolean = false
    private dataStreams: Map<string, DataStream> = new Map<string, DataStream>()
    private dsidsByOids: Map<string, string[]> = new Map<string, string[]>()

    // Singleton
    private static instance: DSStorage
    public static getInstance(): DSStorage {
        if (!DSStorage.instance) {
            DSStorage.instance = new DSStorage()
        }
        return DSStorage.instance
    }
    // Public methods
    public load(): void {
        if (!this.loaded) {
            // check if file exists
            this.checkIfFileExists()
            // Load data streams from file
            try {
                const jsonData = JSON.parse(fs.readFileSync(Config.HOME_PATH + '/' +  Config.DS.FILE).toString())
                jsonData.ds.forEach((ds: any) => {
                    this.dataStreams.set(ds.dsid, new DataStream(ds))
                    // Add to oid map
                    if (this.dsidsByOids.has(ds.oid)) {
                        this.dsidsByOids.get(ds.oid)!.push(ds.dsid)
                    } else {
                        this.dsidsByOids.set(ds.oid, [ds.dsid])
                    }
                })
            } catch {
                logger.error('Error while reading data stream file')
                process.exit()
            }
            logger.info('Loaded data streams: ' + this.dataStreams.size)
            this.loaded = true
        }
    }
    public store(): void {
        logger.debug('Storing ' + this.dataStreams.size + ' data streams to file')
        const dataStreamToStore = Array.from(this.dataStreams.values()).map((ds) => {
            return ds.getObject()
        })
        fs.writeFileSync(Config.HOME_PATH + '/' + Config.DS.FILE, JSON.stringify({ ds: dataStreamToStore }, null, 2))
    }
    public count(): number {
        return this.dataStreams.size
    }
    public addDataStream(ds: DataStreamType): void {
        logger.debug('Adding data stream')
        if (this.dataStreams.has(ds.dsid)) {
            throw new MyError('Data stream already exists', HttpStatusCode.BAD_REQUEST)
        }
        this.dataStreams.set(ds.dsid, new DataStream(ds))
        // Add to oid map
        if (this.dsidsByOids.has(ds.oid)) {
            this.dsidsByOids.get(ds.oid)!.push(ds.dsid)
        } else {
            this.dsidsByOids.set(ds.oid, [ds.dsid])
        }
        this.dataStreams.get(ds.dsid)!.startCollecting()
        // Store to file system 
        this.store()
    }

    public removeDataSteam(dsid: string): void {
        if (this.dataStreams.has(dsid)) {
            // disable dataSteam
            const dataStream = this.dataStreams.get(dsid)!
            dataStream.stopCollecting()
            // Remove from oid map 
            // TBD TEST
            this.dsidsByOids.get(dataStream.oid)!.splice(this.dsidsByOids.get(dataStream.oid)!.indexOf(dsid), 1)
            // Remove from map
            this.dataStreams.delete(dsid)
            // Store to file system
            this.store()
        } else {
            throw new MyError('Data stream does not exist', HttpStatusCode.NOT_FOUND)
        }
    }

    public async updateDatastream(dsid: string, ds: DataStreamType): Promise<void> {
        if (!this.dataStreams.has(dsid)) {
            throw new MyError('Data stream does not exist', HttpStatusCode.NOT_FOUND)
        }
        // update dataSteam
        const dataStream = this.dataStreams.get(dsid)!
        await dataStream.update(ds)
        // Store to file system
        this.store()
    }
    public getDataStream(dsid: string): DataStream {
        if (this.dataStreams.has(dsid)) {
            return this.dataStreams.get(dsid)!
        } else {
            throw new MyError('Data stream does not exist', HttpStatusCode.NOT_FOUND)
        }
    }
    public getDataStreamsByOid(oid: string): DataStream[] {
        if (this.dsidsByOids.has(oid)) {
            const dsids = this.dsidsByOids.get(oid)!
            const dataStreams: DataStream[] = []
            dsids.forEach((dsid) => {
                dataStreams.push(this.dataStreams.get(dsid)!)
            })
            return dataStreams
        } else {
            return []
        }
    }

    // Private methods
    private checkIfFileExists(): void {
        if (!fs.existsSync(Config.HOME_PATH + '/' + Config.DS.FILE)) {
            logger.info('No data stream file found, creating new one')
            fs.writeFileSync(Config.HOME_PATH + '/' + Config.DS.FILE, JSON.stringify({ ds: [] }, null, 2))
        }
    }
}

export const DataStreamStorage = DSStorage.getInstance()
