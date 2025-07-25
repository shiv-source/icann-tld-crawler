"use strict";
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
exports.fetchTLDDetailedInfo = exports.parseTLDDetailsData = void 0;
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./utils");
const constant_1 = require("./constant");
const extractNameServers = ($) => {
    const servers = [];
    $('h2')
        .filter((_, el) => $(el).text().includes('Name Servers'))
        .next('div')
        .find('table tbody tr')
        .each((_, row) => {
        const cells = $(row).find('td');
        const host = $(cells[0]).text().trim();
        const ipHtml = $(cells[1]).html() || '';
        const ipList = ipHtml
            .split('<br>')
            .map((ip) => ip.trim())
            .filter(Boolean);
        servers.push({ host, ipList });
    });
    return servers;
};
const extractRegistryInfo = ($) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const section = $('h2')
        .filter((_, el) => $(el).text().includes('Registry Information'))
        .nextAll('p')
        .first();
    const html = (_a = section.html()) !== null && _a !== void 0 ? _a : '';
    const url = (_c = (_b = html.match(/<a href="([^"]+)">[^<]+<\/a>/)) === null || _b === void 0 ? void 0 : _b[1]) !== null && _c !== void 0 ? _c : '';
    const whois = (_f = (_e = (_d = html.match(/WHOIS Server:<\/b>\s*([^\n<]+)<br/)) === null || _d === void 0 ? void 0 : _d[1]) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : '';
    const rdap = (_j = (_h = (_g = html.match(/RDAP Server:\s*<\/b>\s*([^\s<]+)/)) === null || _g === void 0 ? void 0 : _g[1]) === null || _h === void 0 ? void 0 : _h.trim()) !== null && _j !== void 0 ? _j : '';
    return {
        registrationServiceUrl: url,
        whoisServer: whois,
        rdapServer: rdap,
    };
};
const extractDates = ($) => {
    var _a, _b, _c, _d;
    const text = $('p i').text();
    const updated = (_b = (_a = text.match(/Record last updated (\d{4}-\d{2}-\d{2})/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : '';
    const registered = (_d = (_c = text.match(/Registration date (\d{4}-\d{2}-\d{2})/)) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : '';
    return {
        lastUpdated: updated,
        registeredOn: registered,
    };
};
const parseTLDDetailsData = (html) => {
    const $ = (0, cheerio_1.load)(html);
    return Object.assign({ registry: extractRegistryInfo($), nameServers: extractNameServers($) }, extractDates($));
};
exports.parseTLDDetailsData = parseTLDDetailsData;
const fetchTLDDetailedInfo = (tldMetadata, index) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(tldMetadata.infoUrl, {
            httpsAgent: utils_1.agent,
            headers: constant_1.CUSTOM_HEADERS,
        });
        console.log(`✅ [${index}] Fetched: ${tldMetadata.infoUrl}`);
        const html = response.data;
        const tldTechnicalDetails = (0, exports.parseTLDDetailsData)(html);
        const tldRecord = Object.assign(Object.assign({}, tldMetadata), tldTechnicalDetails);
        return tldRecord;
    }
    catch (err) {
        const customError = new utils_1.CustomAxiosError(err, { tldMetadata });
        console.error(`❌ [${index}] Failed: ${tldMetadata.infoUrl}`, customError.message);
        throw customError;
    }
});
exports.fetchTLDDetailedInfo = fetchTLDDetailedInfo;
