"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOM_HEADERS = exports.ROOT_DB_URL = exports.BASE_URL = void 0;
exports.BASE_URL = 'https://www.iana.org';
exports.ROOT_DB_URL = `${exports.BASE_URL}/domains/root/db`;
exports.CUSTOM_HEADERS = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    Host: 'www.iana.org',
    Pragma: 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
};
