import { logger } from '../utils'
import { dbConnector } from '../microservices/influx-connector'

const REFRESH_TIMEOUT = 60 * 1000 // 1 minute

export const test = async (): Promise<void> => {
   await dbConnector.init()
   await dbConnector.writeData({
      dsid: 'dsid0',
      tags: [{ name: 'test', value: 'testtag' }],
      value: Math.random() * 10,
      timestamp: new Date(),
   })
   const data = await dbConnector.readData('dsid0', {})
}

