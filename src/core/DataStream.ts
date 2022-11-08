import { errorHandler, HttpStatusCode, logger, MyError } from '../utils'
import { agent } from '../microservices/agent-miniConnector'
import { JsonType } from '../types/misc-types'
import { dbConnector } from './DBConnector'

export enum dstype {
    READ_PROPERTY = 'read',
    WRITE_PROPERTY = 'write',
    EVENT = 'event'
}

export type DataStreamType = {
    enabled?: boolean,
    dsid: string,
    oid: string,
    agid: string,
    cid: string,
    iid: string,
    type: dstype,
    service: string,
    requestUrl: string,
    monitors: string,
    frequency?: number,
    queryParams?: JsonType,
    body?: JsonType
}

export type DataStreamCreateType = {
    enabled?: boolean,
    oid: string,
    agid: string,
    cid: string,
    iid: string,
    type: dstype,
    service: string,
    requestUrl: string,
    monitors: string,
    frequency?: number,
    queryParams?: JsonType,
    body?: JsonType
}

export type DataStreamUpdateType = {
    enabled?: boolean,
    monitors?: string,
    frequency?: number,
    queryParams?: JsonType,
    body?: JsonType
}

export class DataStream {
    /**
     * Stream properties
     */
    readonly oid: string
    readonly agid: string
    readonly cid: string
    readonly dsid: string
    readonly iid: string
    readonly service: string
    readonly requestUrl: string
    readonly monitors: string
    readonly streamType: dstype
    private enabled: boolean
    private frequency: number
    private body: JsonType
    private queryParams: JsonType
    /**
     * Variables
     */
    private _lastValue: JsonType = {}
    /**
     * Timers & Events
     */
    private collectingTimer: NodeJS.Timer | number | undefined = undefined
    // private streamEvents: EventEmmiter = new EventEmmiter() 
    // private msgTimeouts: Map<number, NodeJS.Timeout> = new Map<number, NodeJS.Timeout>() // Timers to timeout requests
    // private msgEvents: EventEmmiter = new EventEmmiter() // Handles events inside this class
   
    // Creating event channel
    constructor(dataStream: DataStreamType) {
        if (!dataStream.dsid || !dataStream.oid || !dataStream.agid || !dataStream.cid || !dataStream.iid || !dataStream.type || !dataStream.service || !dataStream.requestUrl || !dataStream.monitors) {
            throw new Error('Missing dataStream properties')
        }
        this.dsid = dataStream.dsid
        this.enabled = dataStream.enabled === false ? false : true // default true
        this.oid = dataStream.oid
        this.agid = dataStream.agid
        this.cid = dataStream.cid
        this.dsid = dataStream.dsid
        this.requestUrl = dataStream.requestUrl
        this.iid = dataStream.iid
        this.service = dataStream.service
        this.monitors = dataStream.monitors
        this.streamType = dataStream.type
        this.frequency = dataStream.frequency ? dataStream.frequency : 600000 
        this.body = dataStream.body ? dataStream.body : {}
        this.queryParams = dataStream.queryParams ? dataStream.queryParams : {}
        // Start collecting data
        if (this.enabled) {
            this.startCollecting()
        }
    }
    public getObject(): DataStreamType {
        return {
            enabled: this.enabled,
            dsid: this.dsid,
            oid: this.oid,
            agid: this.agid,
            cid: this.cid,
            iid: this.iid,
            type: this.streamType,
            service: this.service,
            requestUrl: this.requestUrl,
            monitors: this.monitors,
            frequency: this.frequency,
            queryParams: this.queryParams,
            body: this.body
        }
    }
    public async startCollecting(): Promise<void> {
        if (this.streamType !== dstype.EVENT) {
            if (!this.collectingTimer) {
                this.collectingTimer = setInterval(() => {
                    this.getData()
                }, this.frequency)
                this.enabled = true
            }
        } else {
            logger.debug('Subscribing to event stream')
            try {
                await agent.subscribeToEvent(this.requestUrl)
                this.enabled = true
            } catch (error) {
                logger.error(`Error subscribing to event stream: ${error}`)
            }
        }
    }

    public async stopCollecting(): Promise<void> {
        if (this.streamType !== dstype.EVENT) {
            clearInterval(this.collectingTimer)
            this.collectingTimer = undefined
            this.enabled = false
        } else {
            logger.debug('Unsubscribing to event stream')
            try {
                await agent.unsubscribeEvent(this.requestUrl)
                this.enabled = false
            } catch (error) {
                logger.error(`Error unsubscribing to event stream: ${error}`)
            }
        }
    }

    public async update(ds: DataStreamUpdateType): Promise<void> {
        await this.stopCollecting()
        if (ds.frequency) {
            this.frequency = ds.frequency
        }
        if (ds.enabled !== undefined) {
            if (this.enabled === true && ds.enabled === false) {
                await this.stopCollecting()
                ds.enabled = false
            } else if (this.enabled === false && ds.enabled === true) {
                await this.startCollecting()
                ds.enabled = true
            }
        }
        if (ds.queryParams) {
            this.queryParams = ds.queryParams
        }  
        if (ds.body) {
            this.body = ds.body
        }
        if (this.enabled) {
            await this.startCollecting()
        }
    }

    public set lastValue(data: JsonType) {
        this._lastValue = data
    }
    
    public get lastValue(): JsonType {
        return this._lastValue
    }

    public isCollectingData(): boolean {
        return this.collectingTimer !== undefined
    }    
    public async storeEvent(data: JsonType): Promise<void> {
        try {
            if (data.makesMeasurement) {
                for (const measurement of data.makesMeasurement) {
                    if (measurement.hasValue) {
                        await dbConnector.writeData({
                            dsid: this.dsid,
                            value: measurement.hasValue,
                            timestamp: measurement.hasTimestamp ? new Date(measurement.hasTimestamp) : new Date(),
                            tags: [
                                { name: 'cid', value: this.cid },
                                { name: 'monitors', value: this.monitors },
                                { name: 'iid', value: this.iid },
                                { name: 'agid', value: this.agid }, 
                                { name: 'oid', value: this.oid }, 
                                { name: 'service', value: this.service }]
                        })
                    }
                }
            }
        } catch (err) {
            // NOT AURORAL FORMAT
            const error = errorHandler(err)
            logger.debug('Not auroral format' + error.message)
            await dbConnector.writeData({
                dsid: this.dsid,
                value: data,
                timestamp: new Date(),
            })
        }
    }
    private async getData(): Promise<void> {
        let data: JsonType = {}
        logger.debug(`Collecting data from ${this.requestUrl}`)
        try {
            if (this.streamType === dstype.READ_PROPERTY) {
                data = (await agent.getRequest(this.requestUrl, this.queryParams)).message
            }
            if (this.streamType === dstype.WRITE_PROPERTY) {
                data = (await agent.postRequest(this.requestUrl, this.body, this.queryParams)).message
            }
        } catch (err) {
            const error = errorHandler(err)
            logger.error(`Error while collecting data from ${this.dsid}: ${error.message}`)
            return
        }
        // Save data to database
        this._lastValue = data
        try {
            if (!data.makesMeasurement) {
                throw new MyError('Response is not in standard AURORAL format', HttpStatusCode.BAD_REQUEST)
            }
            for (const measurement of data.makesMeasurement) {
                if (!measurement.hasValue) {
                    throw new MyError('Response is not in standard AURORAL format', HttpStatusCode.BAD_REQUEST)
                }
                try {
                    await dbConnector.writeData({
                        dsid: this.dsid,
                        value: measurement.hasValue,
                        timestamp: measurement.hasTimestamp ? new Date(measurement.hasTimestamp) : new Date(),
                        tags: [
                            { name: 'cid', value: this.cid },
                            { name: 'monitors', value: this.monitors },
                            { name: 'iid', value: this.iid },
                            { name: 'agid', value: this.agid }, 
                            { name: 'oid', value: this.oid }, 
                            { name: 'service', value: this.service }]
                    })
                } catch (err) {
                    const error = errorHandler(err)
                    logger.error(`Error while storing data from ${this.dsid}: ${error.message}`)
                }
            }
        } catch (error) {
            // NOT AURORAL FORMAT
            try {
                await dbConnector.writeData({
                    dsid: this.dsid,
                    value: data,
                    timestamp: new Date(),
                })
            } catch (err) {
                const error = errorHandler(err)
                logger.error(`Error while storing data from ${this.dsid}: ${error.message}`)
            }
        }
    }
}
