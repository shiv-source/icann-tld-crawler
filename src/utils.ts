import path from 'path'
import fs from 'fs-extra'
import https from 'https'
import ejs from 'ejs'
import UserAgent from 'user-agents'
import { markdownTable } from 'markdown-table'
import { CUSTOM_HEADERS } from './constant'
import { TLDMetadata, TLDRecord } from './interface'
import { AxiosError } from 'axios'

export const rootDir = path.resolve(__dirname, '..')

export const agent = new https.Agent({ family: 4 })
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const saveToJsonFile = async <T>(data: T, fileName: string, directory: string = '..'): Promise<void> => {
    const filePath = path.resolve(__dirname, directory, `${fileName}.json`)

    try {
        await fs.ensureDir(path.dirname(filePath))
        await fs.writeJson(filePath, data, { spaces: 2 })
        console.log(`\n✅ Data successfully saved to: ${filePath}\n`)
    } catch (error) {
        const err = error as Error
        console.error(`❌ Failed to save JSON to file: ${filePath}`)
        console.error(`Reason: ${err.message}`)
    }
}

export const getHeaders = () => {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' })
    return {
        ...CUSTOM_HEADERS,
        'User-Agent': userAgent.toString()
    }
}

export const createTable = (tLDRecords: TLDRecord[]): string => {
    const headers = ['ID', 'TLD', 'WhoIs Server', 'RDAP Server', 'Sponsor Organization']

    const records = tLDRecords.map((record) => [
        record.id?.toString() ?? 'N/A',
        `[${record.tld?.trim() || 'N/A'}](${record.infoUrl?.trim() || '#'})`,
        record.registry?.whoisServer?.trim() || 'N/A',
        record.registry?.rdapServer?.trim() || 'N/A',
        record.sponsoringOrganization?.trim() || 'N/A'
    ])

    return markdownTable([headers, ...records])
}

export const saveToReadmeFile = async (genericTLDRecords: TLDRecord[], countryCodeTLDRecords: TLDRecord[]) => {
    const filePath = path.join(rootDir, 'templates/README.md')
    const template = await fs.readFile(filePath, 'utf-8')
    const genericTLDRecordTable = createTable(genericTLDRecords.map((record, index) => ({ ...record, id: index })))
    const countryCodeTLDRecordTable = createTable(countryCodeTLDRecords.map((record, index) => ({ ...record, id: index })))

    const output = await ejs.render(template, {
        genericTLDRecordTable,
        countryCodeTLDRecordTable,
        timestamp: new Date().toUTCString()
    })
    await fs.writeFile(path.join(rootDir, 'README.md'), output)
    console.log(`\n✅ README.md file has been created: ${filePath}\n`)
}

export class CustomAxiosError<T = any> extends AxiosError<T> {
    payload: Record<string, any>

    constructor(error: AxiosError<T>, payload: Record<string, any>) {
        super(error.message, error.code, error.config, error.request, error.response)
        this.name = error.name || 'CustomAxiosError'
        this.stack = error.stack
        this.payload = payload
        this.payload.timestamp = new Date().toISOString()
    }
}

export const getInfoTable = (tldMetadataList: TLDMetadata[], tLDRecords: TLDRecord[], diffInSeconds: number): string => {
    const allSuccess = tldMetadataList.length === tLDRecords.length ? 'YES' : 'NO'
    const table = markdownTable([
        ['Total TLDMetadata', 'Total TLDRecord', 'Total Time (seconds)', 'All Success'],
        [`${tldMetadataList.length}`, `${tLDRecords.length}`, `${diffInSeconds}`, allSuccess]
    ])

    return `\n\n${table}\n\n`
}
