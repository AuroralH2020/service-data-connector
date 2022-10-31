import dotenv from 'dotenv'
import { logger } from './utils/logger'

dotenv.config()
if (!process.env.SERVICE_ENV || !process.env.SERVICE_IP || !process.env.SERVICE_PORT  
	|| !process.env.DS_FILE || !process.env.DB_TYPE) {
	logger.error('Please provide valid .env configuration')
	process.exit()
}

export const Config = {
	SERVICE_ENV: process.env.SERVICE_ENV!,
	HOME_PATH: process.cwd(),
	IP: process.env.SERVICE_IP!,
	PORT: process.env.SERVICE_PORT!,
	DB_TYPE: process.env.DB_TYPE!,
	INFLUX: {
		TOKEN: process.env.INFLUXDB_TOKEN ? process.env.INFLUXDB_TOKEN : '',
		URL: process.env.INFLUXDB_URL ? process.env.INFLUXDB_URL : '',
		ORG: process.env.INFLUXDB_ORG ? process.env.INFLUXDB_ORG : 'my-org',
		BUCKET: process.env.INFLUXDB_BUCKET ? process.env.INFLUXDB_BUCKET : 'bucket0'
	},
	DS: {
		FILE: process.env.DS_FILE ? process.env.DS_FILE : 'dataStreams.json'
	}
}
