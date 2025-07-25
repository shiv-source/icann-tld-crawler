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
exports.getInfoTable = exports.CustomAxiosError = exports.saveToReadmeFile = exports.createTable = exports.getHeaders = exports.saveToJsonFile = exports.delay = exports.agent = exports.rootDir = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const https_1 = __importDefault(require("https"));
const ejs_1 = __importDefault(require("ejs"));
const user_agents_1 = __importDefault(require("user-agents"));
const markdown_table_1 = require("markdown-table");
const constant_1 = require("./constant");
const axios_1 = require("axios");
exports.rootDir = path_1.default.resolve(__dirname, '..');
exports.agent = new https_1.default.Agent({ family: 4 });
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
exports.delay = delay;
const saveToJsonFile = (data_1, fileName_1, ...args_1) => __awaiter(void 0, [data_1, fileName_1, ...args_1], void 0, function* (data, fileName, directory = '..') {
    const filePath = path_1.default.resolve(__dirname, directory, `${fileName}.json`);
    try {
        yield fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
        yield fs_extra_1.default.writeJson(filePath, data, { spaces: 2 });
        console.log(`\n✅ Data successfully saved to: ${filePath}\n`);
    }
    catch (error) {
        const err = error;
        console.error(`❌ Failed to save JSON to file: ${filePath}`);
        console.error(`Reason: ${err.message}`);
    }
});
exports.saveToJsonFile = saveToJsonFile;
const getHeaders = () => {
    const userAgent = new user_agents_1.default({ deviceCategory: 'desktop' });
    return Object.assign(Object.assign({}, constant_1.CUSTOM_HEADERS), { 'User-Agent': userAgent.toString() });
};
exports.getHeaders = getHeaders;
const createTable = (tLDRecords) => {
    const headers = ['ID', 'TLD', 'Category', 'Sponsor Organization', 'WhoIs Server', 'RDAP Server'];
    const records = tLDRecords.map((record) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return [
            (_b = (_a = record.id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : 'N/A',
            `[${((_c = record.tld) === null || _c === void 0 ? void 0 : _c.trim()) || 'N/A'}](${((_d = record.infoUrl) === null || _d === void 0 ? void 0 : _d.trim()) || '#'})`,
            ((_e = record.category) === null || _e === void 0 ? void 0 : _e.trim()) || 'N/A',
            ((_f = record.sponsoringOrganization) === null || _f === void 0 ? void 0 : _f.trim()) || 'N/A',
            ((_h = (_g = record.registry) === null || _g === void 0 ? void 0 : _g.whoisServer) === null || _h === void 0 ? void 0 : _h.trim()) || 'N/A',
            ((_k = (_j = record.registry) === null || _j === void 0 ? void 0 : _j.rdapServer) === null || _k === void 0 ? void 0 : _k.trim()) || 'N/A',
        ];
    });
    return (0, markdown_table_1.markdownTable)([headers, ...records]);
};
exports.createTable = createTable;
const saveToReadmeFile = (tLDRecords) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path_1.default.join(exports.rootDir, 'templates/README.ejs');
    const template = yield fs_extra_1.default.readFile(filePath, 'utf-8');
    const table = (0, exports.createTable)(tLDRecords);
    const output = yield ejs_1.default.render(template, { table, timestamp: new Date().toUTCString() });
    yield fs_extra_1.default.writeFile(path_1.default.join(exports.rootDir, 'README.md'), output);
    console.log(`\n✅ README.md file has been created: ${filePath}\n`);
});
exports.saveToReadmeFile = saveToReadmeFile;
class CustomAxiosError extends axios_1.AxiosError {
    constructor(error, payload) {
        super(error.message, error.code, error.config, error.request, error.response);
        this.name = error.name || 'CustomAxiosError';
        this.stack = error.stack;
        this.payload = payload;
        this.payload.timestamp = new Date().toISOString();
    }
}
exports.CustomAxiosError = CustomAxiosError;
const getInfoTable = (tldMetadataList, tLDRecords, diffInSeconds) => {
    const allSuccess = tldMetadataList.length === tLDRecords.length ? 'YES' : 'NO';
    const table = (0, markdown_table_1.markdownTable)([
        ['Total TLDMetadata', 'Total TLDRecord', 'Total Time (seconds)', 'All Success'],
        [`${tldMetadataList.length}`, `${tLDRecords.length}`, `${diffInSeconds}`, allSuccess],
    ]);
    return `\n\n${table}\n\n`;
};
exports.getInfoTable = getInfoTable;
