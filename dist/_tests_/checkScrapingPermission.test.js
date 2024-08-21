"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require('chalk');
const checkScrapingPermission_1 = require("../checkScrapingPermission");
async function runTests() {
    const testCases = [
        { url: 'https://wikipedia.org', expected: 'Scraping is allowed' },
        { url: 'https://www.imdb.com/', expected: 'Scraping is not allowed' },
        { url: 'https://www.linkedin.com/', expected: 'Scraping is not allowed' },
        { url: 'https://www.google.com/', expected: 'Scraping is allowed' },
        { url: 'https://www.facebook.com/', expected: 'Scraping is not allowed' },
        // Add more test cases as needed
    ];
    for (const testCase of testCases) {
        console.log(`Testing URL: ${testCase.url}`);
        const result = await (0, checkScrapingPermission_1.checkScrapingPermission)(testCase.url, false);
        console.log(`Expected: ${testCase.expected}, Got: ${result}`);
        console.log(result === testCase.expected ? chalk.green('PASS') : chalk.red('FAIL'));
        console.log('--------------------------------------------------');
    }
    process.exit(0);
}
runTests().catch(error => console.error('Error running tests:', error));
