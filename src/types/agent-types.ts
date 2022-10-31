
export interface GenericResponse<T=any> {
    error?: string
    message: T
}

export interface NodeDescription {
    cid: string,
    agid: string,
    company: string
}

export interface ItemDescription {
    name: string,
    cid: string,
    oid: string,
    dataAccess: boolean,
    agid: string,
    company: string
}

export interface PartnerInfo {
    name: string,
    nodes: string[]
}

export interface ContractInfo {
    ctid: string,
    cid: string,
    items: string[]
}

export interface CommunityDescription {
    commId: string,
    name: string,
    description: string
}

export interface AgentInfo {
    cid: string,
    nodes: string,
    last_privacy_update: string,
    last_partners_update: string,
    last_configuration_update: string,
    organisation: string,
    registrations: string,
    agid: string
}
