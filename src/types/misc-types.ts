export type JsonType<T=any> = {
    [x: string]: T
}

export enum CONTENT_TYPE_ENUM {
    RDFN3 = 'text/rdf+n3',
	N3 = 'text/n3', 
    NTRIPLES = 'text/ntriples', 
    RDFTTL = 'text/rdf+ttl',
    RDFNT = 'text/rdf+nt', 
    PLAIN = 'text/plain', 
    RDFTURTLE = 'text/rdf+turtle', 
    TURTLE = 'text/turtle',
	APPTURTLE = 'application/turtle', 
    APPXTURTLE = 'application/x-turtle', 
    APPXNICETURTLE = 'application/x-nice-turtle', 
    JSON = 'application/json',
	ODATAJSON = 'application/odata+json', 
    JSONLD = 'application/ld+json', 
    XTRIG = 'application/x-trig', 
    RDFXML = 'application/rdf+xml'
}

export const CONTENT_TYPE_LIST = Object.values(CONTENT_TYPE_ENUM)

export enum GrantType {
    DATA_ACCESS = 'dataAccess',
    SERVICE_STORE = 'serviceStore',
}

export type ACL = {
    cid: string[],
    agid: string[],
    oid: string[]
}

export type DBSearchResult = {
    dsid: string,
    oid: string,
    iid: string,
    hasMeasurements: {
        value: any,
        timestamp: Date
    }[]
}

export type ThingMapping = {
    '@context': any,
    '@type': string,
    oid: string,
    iid: string,
    makesMeasurement: 
        {
            hasValue: string, 
            hasTimestamp: string, 
            aboutProperty: string
        }[]
}

// export type BasicReponse<T=any> = {
//     error?: string
//     message?: T
// }

// export type KeyValue = {
//     key: string,
//     value: string
// }

