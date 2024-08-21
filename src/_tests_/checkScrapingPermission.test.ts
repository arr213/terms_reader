const chalk = require('chalk');
import { checkScrapingPermission } from '../checkScrapingPermission';

async function runTests() {
    const testCases = [
        { url: 'https://wikipedia.org', expected: 'Scraping is allowed' },
        { url: 'https://www.github.com/', expected: 'Scraping is allowed' },
        { url: 'https://www.facebook.com/', expected: 'Scraping is not allowed' },
        { url: 'https://www.google.com/', expected: 'Scraping is not allowed' },
    ];

    for (const testCase of testCases) {
        console.log(`Testing URL: ${testCase.url}`);
        const result = await checkScrapingPermission(testCase.url, false);
        console.log(`Expected: ${testCase.expected}, Got: ${result}`);
        console.log(result === testCase.expected ? chalk.green('PASS') : chalk.red('FAIL'));
        console.log('--------------------------------------------------');
    }
    process.exit(0);
}

runTests().catch(error => console.error('Error running tests:', error));
