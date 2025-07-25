import axios from 'axios'
import * as cheerio from 'cheerio'
import { BASE_URL, ROOT_DB_URL, CUSTOM_HEADERS } from './constant'
import { agent, delay, getInfoTable, saveToJsonFile, saveToReadmeFile } from './utils'
import { TLDMetadata, TLDRecord } from './interface'
import { fetchTLDDetailedInfo } from './tld-details'

const timeStart = Date.now()

export const getTLDData = async () => {
    try {
        const response = await axios.get(ROOT_DB_URL, {
            httpsAgent: agent,
            headers: CUSTOM_HEADERS
        })

        const html = response.data
        let tldMetadataList: TLDMetadata[] = []

        const $ = cheerio.load(html)
        $('.iana-table tbody tr').each((i, el) => {
            const linkEl = $(el).find('td a')
            const tld = $(el).find('td a').text().trim()
            const infoUrl = BASE_URL + linkEl.attr('href')
            const category = $(el).find('td:nth-child(2)').text().trim()
            const sponsoringOrganization = $(el).find('td:nth-child(3)').text().trim()
            if (tld) {
                tldMetadataList.push({ id: i + 1, tld, category, sponsoringOrganization, infoUrl })
            }
        })

        console.log('✅ Total TLDMetadata :', tldMetadataList.length)
        const tLDRecords = await getTLDRecordsWithRetry(tldMetadataList)

        await saveToJsonFile(tLDRecords, 'tlds')
        await saveToReadmeFile(tLDRecords)

        const diffInSeconds = (Date.now() - timeStart) / 1000
        console.log(getInfoTable(tldMetadataList, tLDRecords, diffInSeconds))
    } catch (err) {
        console.error('Error scraping IANA Root DB:', err as Error)
    }
}

const getTLDRecordsWithRetry = async (
    tldMetadataList: TLDMetadata[],
    MAX_RETRIES = 5,
    BATCH_SIZE = 500,
    BATCH_DELAY_MS = 200
) => {
    let tldRecords: TLDRecord[] = []
    let currentBatchSize = BATCH_SIZE

    if (!tldMetadataList.length) return tldRecords

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const failedTlds: TLDMetadata[] = []
        const totalBatches = Math.ceil(tldMetadataList.length / currentBatchSize)

        console.log(
            `🔁 Attempt ${attempt}/${MAX_RETRIES} - Batch size: ${currentBatchSize} - ${tldMetadataList.length} items in ${totalBatches} batches`
        )

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const start = batchIndex * currentBatchSize
            const end = Math.min(start + currentBatchSize, tldMetadataList.length)
            const batch = tldMetadataList.slice(start, end)

            console.log(`🔄 Batch ${batchIndex + 1}/${totalBatches} (items ${start} to ${end - 1})`)

            const results = await Promise.allSettled(batch.map((item, i) => fetchTLDDetailedInfo(item, start + i)))

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    tldRecords.push(result.value)
                } else if (result.status === 'rejected' && result.reason?.payload?.tldMetadata) {
                    failedTlds.push(result.reason.payload.tldMetadata)
                }
            })

            await delay(BATCH_DELAY_MS)
        }

        if (!failedTlds.length) break
        console.log(`⚠️ Failed TLDs after attempt ${attempt}: ${failedTlds.length}`)
        tldMetadataList = failedTlds
        const reducedSize = Math.floor(currentBatchSize / 3)
        currentBatchSize = Math.max(
            20,
            Math.min(tldMetadataList.length, Math.min(reducedSize, Math.floor(tldMetadataList.length / 3)))
        )
        await delay(Math.floor(BATCH_DELAY_MS / 2))
    }

    if (tldRecords.length) {
        tldRecords = tldRecords.sort((a, b) => a.id - b.id)
    }

    return tldRecords
}

getTLDData()
