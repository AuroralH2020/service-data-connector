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

// AUTHENTICATION
.post('/streams', controller.addStream)
.get('/streams/oid/:oid', controller.getStreamsByOid)
.get('/streams/:dsid', controller.getStream)
.put('/streams/:dsid', controller.putStream)
.post('/streams/:id/enable', controller.enableStream)
.delete('/streams/:id/disable', controller.disableStream)
.delete('/streams/:id', controller.deleteStream)
// .get('/streams/:id/data', controller.dummy)

// Agent 
.put('/event/:oid/:eid', controller.incomingEvent)

export { ApiRouter }
