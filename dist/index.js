"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTLDData = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const constant_1 = require("./constant");
const utils_1 = require("./utils");
const tld_details_1 = require("./tld-details");
const timeStart = Date.now();
const getTLDData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(constant_1.ROOT_DB_URL, {
            httpsAgent: utils_1.agent,
            headers: constant_1.CUSTOM_HEADERS
        });
        const html = response.data;
        let tldMetadataList = [];
        const $ = cheerio.load(html);
        $('.iana-table tbody tr').each((i, el) => {
            const linkEl = $(el).find('td a');
            const tld = $(el).find('td a').text().replace(/^\./, '').trim();
            const infoUrl = constant_1.BASE_URL + linkEl.attr('href');
            const category = $(el).find('td:nth-child(2)').text().trim();
            let sponsoringOrganization = $(el).find('td:nth-child(3)').text().trim();
            sponsoringOrganization = sponsoringOrganization.replace(/\n/g, ' ').trim();
            if (tld) {
                tldMetadataList.push({ id: i + 1, tld, category, sponsoringOrganization, infoUrl });
            }
        });
        console.log('✅ Total TLDMetadata :', tldMetadataList.length);
        const tLDRecords = yield getTLDRecordsWithRetry(tldMetadataList);
        const cleanedTLDRecords = tLDRecords.filter((record) => record.registry.rdapServer || record.registry.whoisServer);
        const genericTLDRecords = cleanedTLDRecords.filter((record) => record.category === 'generic');
        const countryCodeTLDRecords = cleanedTLDRecords.filter((record) => record.category === 'country-code');
        const minifiedTLDRecords = getTLDMinifiedRecord(tLDRecords);
        yield (0, utils_1.saveToJsonFile)(cleanedTLDRecords, 'data/tlds');
        yield (0, utils_1.saveToJsonFile)(minifiedTLDRecords, 'data/tlds-minified');
        yield (0, utils_1.saveToJsonFile)(genericTLDRecords, 'data/generic-tlds');
        yield (0, utils_1.saveToJsonFile)(countryCodeTLDRecords, 'data/country-code-tlds');
        yield (0, utils_1.saveToReadmeFile)(genericTLDRecords, countryCodeTLDRecords);
        const diffInSeconds = (Date.now() - timeStart) / 1000;
        console.log((0, utils_1.getInfoTable)(tldMetadataList, tLDRecords, diffInSeconds));
    }
    catch (err) {
        console.error('Error scraping IANA Root DB:', err);
    }
});
exports.getTLDData = getTLDData;
const getTLDMinifiedRecord = (tLDRecords) => tLDRecords.map((record) => ({
    id: record.id,
    tld: record.tld,
    category: record.category,
    registry: record.registry
}));
const getTLDRecordsWithRetry = (tldMetadataList_1, ...args_1) => __awaiter(void 0, [tldMetadataList_1, ...args_1], void 0, function* (tldMetadataList, MAX_RETRIES = 5, BATCH_SIZE = 500, BATCH_DELAY_MS = 200) {
    let tldRecords = [];
    let currentBatchSize = BATCH_SIZE;
    if (!tldMetadataList.length)
        return tldRecords;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const failedTlds = [];
        const totalBatches = Math.ceil(tldMetadataList.length / currentBatchSize);
        console.log(`🔁 Attempt ${attempt}/${MAX_RETRIES} - Batch size: ${currentBatchSize} - ${tldMetadataList.length} items in ${totalBatches} batches`);
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const start = batchIndex * currentBatchSize;
            const end = Math.min(start + currentBatchSize, tldMetadataList.length);
            const batch = tldMetadataList.slice(start, end);
            console.log(`🔄 Batch ${batchIndex + 1}/${totalBatches} (items ${start} to ${end - 1})`);
            const results = yield Promise.allSettled(batch.map((item, i) => (0, tld_details_1.fetchTLDDetailedInfo)(item, start + i)));
            results.forEach((result) => {
                var _a, _b;
                if (result.status === 'fulfilled' && result.value) {
                    tldRecords.push(result.value);
                }
                else if (result.status === 'rejected' && ((_b = (_a = result.reason) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.tldMetadata)) {
                    failedTlds.push(result.reason.payload.tldMetadata);
                }
            });
            yield (0, utils_1.delay)(BATCH_DELAY_MS);
        }
        if (!failedTlds.length)
            break;
        console.log(`⚠️ Failed TLDs after attempt ${attempt}: ${failedTlds.length}`);
        tldMetadataList = failedTlds;
        const reducedSize = Math.floor(currentBatchSize / 3);
        currentBatchSize = Math.max(20, Math.min(tldMetadataList.length, Math.min(reducedSize, Math.floor(tldMetadataList.length / 3))));
        yield (0, utils_1.delay)(Math.floor(BATCH_DELAY_MS / 2));
    }
    if (tldRecords.length) {
        tldRecords = tldRecords.sort((a, b) => a.id - b.id);
    }
    return tldRecords;
});
(0, exports.getTLDData)();
