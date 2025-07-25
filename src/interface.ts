export interface NameServerInfo {
    host: string
    ipList: string[]
}

export interface RegistryDetails {
    registrationServiceUrl: string
    whoisServer: string
    rdapServer: string
}

export interface TLDRecordTimestamps {
    lastUpdated: string
    registeredOn: string
}

export interface TLDTechnicalDetails extends TLDRecordTimestamps {
    nameServers: NameServerInfo[]
    registry: RegistryDetails
}

export interface TLDMetadata {
    id: number
    tld: string
    category: string
    sponsoringOrganization: string
    infoUrl: string
}

export interface TLDRecord extends TLDMetadata, TLDTechnicalDetails {}
