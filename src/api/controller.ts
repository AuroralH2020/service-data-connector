// Controller common imports
import { expressTypes } from '../types/index'
import { HttpStatusCode } from '../utils/http-status-codes'
import { logger, errorHandler } from '../utils'
import { responseBuilder } from '../utils/response-builder'
import { DataStreamType, dstype } from '../core/DataStream'
import { DataStreamStorage } from '../persistance/dataStreamStorage'
import { JsonType } from '../types/misc-types'

// Imports

/**
 * Controllers
 */   

// Dummy
type DummyCtrl = expressTypes.Controller<{}, {}, {}, string, {}>

export const dummy: DummyCtrl = async (_req, res) => {
    try {
        logger.debug('TEST ENDPOINT')
        return responseBuilder(HttpStatusCode.OK, res, null, 'Hello world')
	} catch (err) {
        const error = errorHandler(err)
        logger.error(error.message)
        return responseBuilder(error.status, res, error.message)
	}
}

type AddStreamController = expressTypes.Controller<{}, DataStreamType, {}, { }, {}>

export const addStream: AddStreamController = async (req, res) => {
        try {
                DataStreamStorage.addDataStream(req.body)
                return responseBuilder(HttpStatusCode.OK, res, null, {})
        } catch (err) {
                const error = errorHandler(err)
                logger.error(error.message)
                return responseBuilder(error.status, res, error.message)
        }
}

type GetStreamsByOidCtrl = expressTypes.Controller<{oid: string}, {}, {}, DataStreamType[], {}>

export const getStreamsByOid: GetStreamsByOidCtrl = async (req, res) => {
        try {
                const streams = DataStreamStorage.getDataStreamsByOid(req.params.oid)
                return responseBuilder(HttpStatusCode.OK, res, null, streams.map(stream => stream.getObject()))
        } catch (err) {
                const error = errorHandler(err)
                logger.error(error.message)
                return responseBuilder(error.status, res, error.message)
        }
}

type getStreamCtrl = expressTypes.Controller<{ dsid: string }, {}, {}, DataStreamType, {}>

export const getStream: getStreamCtrl = async (req, res) => {
        try {
                const stream = DataStreamStorage.getDataStream(req.params.dsid)
                return responseBuilder(HttpStatusCode.OK, res, null, stream.getObject())
        } catch (err) {
                const error = errorHandler(err)
                logger.error(error.message)
                return responseBuilder(error.status, res, error.message)
        }
}

type deleteStreamCtrl = expressTypes.Controller<{ dsid: string }, {}, {}, {}, {}>

export const deleteStream: deleteStreamCtrl = async (req, res) => {
        try {
                DataStreamStorage.removeDataSteam(req.params.dsid)
                return responseBuilder(HttpStatusCode.OK, res, null, {})
        } catch (err) {
                const error = errorHandler(err)
                logger.error(error.message)
                return responseBuilder(error.status, res, error.message)
        }
}

type putStreamCtrl = expressTypes.Controller<{ dsid: string }, DataStreamType, {}, {}, {}>

export const putStream: putStreamCtrl = async (req, res) => {
        try {
                await DataStreamStorage.updateDatastream(req.params.dsid, req.body)
                // TBD
                return responseBuilder(HttpStatusCode.OK, res, null, {})
        } catch (err) {
                const error = errorHandler(err)
                logger.error(error.message)
                return responseBuilder(error.status, res, error.message)
        }
}

type disableStreamCtrl = expressTypes.Controller<{ dsid: string }, {}, {}, {}, {}>

export const disableStream: disableStreamCtrl = async (req, res) => {
        const dsid = req.params.dsid
        try {
                await DataStreamStorage.getDataStream(dsid).update({ enabled: false })
                return responseBuilder(HttpStatusCode.OK, res, null, {})
        } catch (err) {
                const error = errorHandler(err)
                logger.error(error.message)
                return responseBuilder(error.status, res, error.message)
        }
}

type enableStreamCtrl = expressTypes.Controller<{ dsid: string }, {}, {}, {}, {}>

export const enableStream: enableStreamCtrl = async (req, res) => {
        const dsid = req.params.dsid
        try {
                await DataStreamStorage.getDataStream(dsid).update({ enabled: true })
                return responseBuilder(HttpStatusCode.OK, res, null, {})
        } catch (err) {
                const error = errorHandler(err)
                logger.error(error.message)
                return responseBuilder(error.status, res, error.message)
        }
}

type eventCtrl = expressTypes.Controller<{ oid: string, eid: string }, JsonType, {}, {}, {}>

export const incomingEvent: eventCtrl = async (req, res) => {
        const { eid } = req.params
        const data  = req.body
        const sourceoid = req.headers.sourceoid ? req.headers.sourceoid.toString() : undefined 
        try {
                logger.debug(`Incoming event ${eid} from ${sourceoid}`)
                if (!sourceoid) {
                        throw new Error('No sourceoid in headers')
                }
                const dataStreams = DataStreamStorage.getDataStreamsByOid(sourceoid)
                for (const ds of dataStreams) {
                        const  dsObject = ds.getObject()
                        if (dsObject.type === dstype.EVENT && dsObject.iid === eid) {
                                logger.debug('Found matching datastream for event: ' + dsObject.dsid)
                                ds.storeEvent(data)
                        }
                }
                return responseBuilder(HttpStatusCode.OK, res, null, {})
        } catch (err) {
                const error = errorHandler(err)
                logger.error(error.message)
                return responseBuilder(error.status, res, error.message)
        }
}

