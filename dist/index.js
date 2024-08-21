"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkScrapingPermission_1 = require("./checkScrapingPermission");
(async function main() {
    const url = 'https://imdb.com';
    console.log(`Checking scraping permission for ${url}...`);
    const res = await (0, checkScrapingPermission_1.checkScrapingPermission)(url, true);
    console.log(res);
    console.log('See more information in the output folder.');
    process.exit(0);
})();
