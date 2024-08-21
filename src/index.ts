import { checkScrapingPermission } from "./checkScrapingPermission";

(async function main() {
    const url = 'https://facebook.com';
    const shouldWriteFiles = true;
    const pageLimit = 10;

    console.log(`Checking scraping permission for ${url}...`);
    const res = await checkScrapingPermission(url, shouldWriteFiles, pageLimit);
    console.log(res);
    console.log('See more information in the output folder.')

    process.exit(0);
})();