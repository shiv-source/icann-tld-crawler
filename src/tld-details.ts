import { load, CheerioAPI } from 'cheerio'
import { NameServerInfo, RegistryDetails, TLDMetadata, TLDRecord, TLDRecordTimestamps, TLDTechnicalDetails } from './interface'
import axios from 'axios'
import { agent, CustomAxiosError } from './utils'
import { CUSTOM_HEADERS } from './constant'

const extractNameServers = ($: CheerioAPI): NameServerInfo[] => {
    const servers: NameServerInfo[] = []

    $('h2')
        .filter((_, el) => $(el).text().includes('Name Servers'))
        .next('div')
        .find('table tbody tr')
        .each((_, row) => {
            const cells = $(row).find('td')
            const host = $(cells[0]).text().trim()

            const ipHtml = $(cells[1]).html() || ''
            const ipList = ipHtml
                .split('<br>')
                .map((ip) => ip.trim())
                .filter(Boolean)

            servers.push({ host, ipList })
        })

    return servers
}

const extractRegistryInfo = ($: CheerioAPI): RegistryDetails => {
    const section = $('h2')
        .filter((_, el) => $(el).text().includes('Registry Information'))
        .nextAll('p')
        .first()

    const html = section.html() ?? ''

    const url = html.match(/<a href="([^"]+)">[^<]+<\/a>/)?.[1] ?? ''
    const whois = html.match(/WHOIS Server:<\/b>\s*([^\n<]+)<br/)?.[1]?.trim() ?? ''
    const rdap = html.match(/RDAP Server:\s*<\/b>\s*([^\s<]+)/)?.[1]?.trim() ?? ''

    return {
        registrationServiceUrl: url,
        whoisServer: whois,
        rdapServer: rdap,
    }
}

const extractDates = ($: CheerioAPI): TLDRecordTimestamps => {
    const text = $('p i').text()

    const updated = text.match(/Record last updated (\d{4}-\d{2}-\d{2})/)?.[1] ?? ''
    const registered = text.match(/Registration date (\d{4}-\d{2}-\d{2})/)?.[1] ?? ''

    return {
        lastUpdated: updated,
        registeredOn: registered,
    }
}

export const parseTLDDetailsData = (html: string): TLDTechnicalDetails => {
    const $ = load(html)

    return {
        registry: extractRegistryInfo($),
        nameServers: extractNameServers($),
        ...extractDates($),
    }
}

export const fetchTLDDetailedInfo = async (tldMetadata: TLDMetadata, index: number) => {
    try {
        const response = await axios.get(tldMetadata.infoUrl, {
            httpsAgent: agent,
            headers: CUSTOM_HEADERS,
        })
        console.log(`✅ [${index}] Fetched: ${tldMetadata.infoUrl}`)

        const html = response.data

        const tldTechnicalDetails = parseTLDDetailsData(html)

        const tldRecord: TLDRecord = {
            ...tldMetadata,
            ...tldTechnicalDetails,
        }
        return tldRecord
    } catch (err) {
        const customError = new CustomAxiosError(err as any, { tldMetadata })
        console.error(`❌ [${index}] Failed: ${tldMetadata.infoUrl}`, customError.message)
        throw customError
    }
}
