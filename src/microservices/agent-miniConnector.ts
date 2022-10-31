/**
* Interface to interact with the Neighbourhood Manager
* @interface
*/ 

import got from 'got'
import { logger, errorHandler, MyError } from '../utils'
import { GenericResponse } from '../types/agent-types'
import { JsonType } from '../types/misc-types'

// CONSTANTS 

const ApiHeader = { 
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json',
    simple: 'false' 
}

export const agent = {
    // Registry
    getRequest: async function(url: string, searchParams?: JsonType): Promise<GenericResponse<JsonType>> {
        try {
            return await got.get(url, { searchParams, headers: ApiHeader }).json()
        } catch (err: unknown) {
            const error = errorHandler(err)
            logger.error('getRequest failed...')
            throw new MyError(error.message, error.status)
        }
    },
    postRequest: async function(url: string, body: JsonType, searchParams?: JsonType): Promise<GenericResponse<JsonType>> {
        try {
            // return (await request(url, 'POST', body, { ...ApiHeader }, searchParams))
            return await got.post(url, { json: body, searchParams, headers: ApiHeader }).json()
        } catch (err: unknown) {
            const error = errorHandler(err)
            logger.error('postRequest failed...')
            throw new MyError(error.message, error.status)
        }
    },
    subscribeToEvent: async function(url: string): Promise<GenericResponse<JsonType>> {
        try {
            return await got.post(url, { headers: ApiHeader, responseType: 'json' }).json()
        } catch (err: unknown) {
            const error = errorHandler(err)
            logger.error('subscribeToEvent failed...')
            throw new MyError(error.message, error.status)
        }
    },
    unsubscribeEvent: async function(url: string): Promise<GenericResponse<JsonType>> {
        try {
            return await got.delete(url, { headers: ApiHeader, responseType: 'json' }).json()
        } catch (err: unknown) {
            const error = errorHandler(err)
            logger.error('unsubscribeEvent failed...')
            throw new MyError(error.message, error.status)
        }
    }
}
