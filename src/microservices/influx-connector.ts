/**
* Interface to interact with Influx-DB
* @interface
*/ 
import { InfluxDB, QueryApi, Point, WriteApi } from '@influxdata/influxdb-client'
import { Config } from '../config'
import { logger } from '../utils'
import { DBEntry, DBSearch, DBConnectorInterface } from '../types/db-connector-types'

export class InfluxConnector implements DBConnectorInterface {
    private WriteApi: WriteApi
    private QueryApi: QueryApi

    constructor() {
        const influx = new InfluxDB({ url: Config.INFLUX.URL, token: Config.INFLUX.TOKEN })
        this.WriteApi = influx.getWriteApi(Config.INFLUX.ORG, Config.INFLUX.BUCKET, 'ns')   
        this.QueryApi = influx.getQueryApi(Config.INFLUX.ORG)
    }
    // Public methods
    public async init(): Promise<void> {
        logger.info('Influx DB')
    }
    // TBD: extend with from: to: timestamp? 
    public async readData(dsid: string, searchQuerry: DBSearch): Promise<{ value: any, timestamp: Date }[]> {
        logger.debug('readData ')
        const fluxQuery = buildQuery(dsid, searchQuerry)
        try {
            const data = await this.QueryApi.collectRows(fluxQuery) as { _time: string, _value: string }[]
            return data.map((d) => {
                return {
                    value: d._value,
                    timestamp: new Date(d._time),
                }
            })
        } catch (e) {
            logger.error('Error reading data')
            throw e
        }
    }

    public async close(): Promise<void> {
        await this.WriteApi.close()
        logger.debug('Connection closed')
    }
    public async writeData(toStore: DBEntry): Promise<void> {
        const point1 = new Point(toStore.dsid)
        // add optional tag
        if (toStore.tags) {
            for (const tag of toStore.tags) {
                point1.tag(tag.name, tag.value)
            }
        }
        // timestamp
        point1.timestamp(toStore.timestamp)

        // value
        switch (typeof toStore.value) {
            case 'number':
                point1.floatField('value', toStore.value)
                break
            default:
                point1.stringField('value', toStore.value.toString())
                break
        }

        // write to Influx
        this.WriteApi.writePoint(point1)
        await this.WriteApi.flush()
    }
}
// private functions
const buildQuery = (dsid: string, searchQuerry: DBSearch): string => {
    if (searchQuerry.start && searchQuerry.end) {
    // start and end defined
        return `from(bucket:"${Config.INFLUX.BUCKET}") |> range(start: ${searchQuerry.start}, stop: ${searchQuerry.end}) |> filter(fn: (r) => r._measurement == "${dsid}")`
    }
    // only start defined
    if (searchQuerry.start) {
        return `from(bucket:"${Config.INFLUX.BUCKET}") |> range(start: ${searchQuerry.start}) |> filter(fn: (r) => r._measurement == "${dsid}")`
    }
    // no range defined
    if (searchQuerry.points) {
        return `from(bucket:"${Config.INFLUX.BUCKET}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "${dsid}") |> limit(n: ${searchQuerry.points})`
    }
    // TBD: add points
    // FIX QUERY
    return `from(bucket:"${Config.INFLUX.BUCKET}") |> range(start: 0) |> filter(fn: (r) => r._measurement == "${dsid}")  |> last()`
}

// Singleton instance
export const dbConnector = new InfluxConnector()
