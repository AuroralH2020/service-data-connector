/**
 * routes.js
 * Administration router interface
 * Endpoint 'api'
 * @interface
 */
// Express router
import { Router } from 'express'
// Middlewares
// Controllers
import * as controller from './controller'

const ApiRouter = Router()

ApiRouter
// DUMMY
.get('/test/api', controller.dummy)

// SERVICE ADMIN APP
.get('/healthcheck', controller.healthcheck)
.post('/streams', controller.addStream)
.get('/streams/service/:oid', controller.getStreamsByService)
.get('/streams/:dsid', controller.getStream)
.put('/streams/:dsid', controller.putStream)
.post('/streams/:dsid/enable', controller.enableStream)
.delete('/streams/:dsid/disable', controller.disableStream)
.delete('/streams/:dsid', controller.deleteStream)
// .get('/streams/oid/:oid', controller.getStreamsByOid)
// .get('/streams/:id/data', controller.dummy)

// Agent 
.put('/event/:oid/:eid', controller.incomingEvent)

export { ApiRouter }
