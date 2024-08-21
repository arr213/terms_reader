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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkScrapingPermission = checkScrapingPermission;
const puppeteer = __importStar(require("puppeteer"));
const fs = __importStar(require("fs"));
async function checkScrapingPermission(url, shouldWriteFiles = true, pageLimit = 10) {
    try {
        // Step 1: Launch a headless browser and navigate to the page
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        // Step 2: Ensure all content is loaded by waiting for a specific element
        await page.waitForNetworkIdle();
        // Optional: Scroll to the bottom to trigger any lazy-loaded content
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForNetworkIdle();
        // await new Promise(resolve => setTimeout(resolve, 1000));
        // Step 3: Initialize ToS links array and visited set
        let tosLinks = await page.evaluate(() => {
            console.log("Links", Array.from(document.querySelectorAll('a')));
            return Array.from(document.querySelectorAll('a'))
                .filter(a => {
                const text = a.textContent?.toLowerCase() || '';
                return text.includes('terms') || text.includes('service') || text.includes('conditions') || text.includes('use');
            })
                .map(a => a.href);
        });
        if (tosLinks.length === 0) {
            throw new Error('No Terms of Service links found.');
        }
        const visitedLinks = new Set();
        const summaryLines = [];
        // Step 4: Loop through the tosLinks array and search for additional ToS links on each page
        for (let i = 0; i < tosLinks.length && tosLinks.length < pageLimit; i++) {
            const link = tosLinks[i];
            if (visitedLinks.has(link))
                continue;
            visitedLinks.add(link);
            await page.goto(link, { waitUntil: 'networkidle2' });
            const tosHtml = await page.content();
            const fileName = `terms_of_service_${visitedLinks.size}.html`;
            if (shouldWriteFiles) {
                fs.writeFileSync(`output/${fileName}`, tosHtml);
            }
            // Add to the summary
            summaryLines.push(`${visitedLinks.size}. ${link}`);
            const pageTosLinks = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a'))
                    .filter(a => {
                    const text = a.textContent?.toLowerCase() || '';
                    return text.includes('terms') || text.includes('service');
                })
                    .map(a => a.href);
            });
            // Add new links to the tosLinks array if they haven't been visited yet and if we have less than 10 (or provided limit)
            pageTosLinks.forEach(newLink => {
                if (!visitedLinks.has(newLink) && !tosLinks.includes(newLink) && tosLinks.length < pageLimit) {
                    tosLinks.push(newLink);
                }
            });
            // Stop searching if we have reached the limit of 10 ToS links (or provided limit)
            if (tosLinks.length >= pageLimit) {
                break;
            }
        }
        // Ensure that all discovered links are included in the summary
        for (let i = summaryLines.length + 1; i <= tosLinks.length; i++) {
            summaryLines.push(`${i}. ${tosLinks[i - 1]}`);
            const fileName = `terms_of_service_${i}.html`;
            await page.goto(tosLinks[i - 1], { waitUntil: 'networkidle2' });
            const tosHtml = await page.content();
            if (shouldWriteFiles) {
                fs.writeFileSync(`output/${fileName}`, tosHtml);
            }
        }
        // Step 5: Analyze all collected ToS pages for scraping-related terms
        const disallowTerms = [
            'no scraping',
            'no automated',
            'no bots',
            'no robot',
            'no data mining',
            'may not access or collect',
            'may not collect',
            'may not use automated means',
            'using automated means'
        ];
        const allowTerms = [
            'allowed',
            'permitted',
            'permission',
            'you may scrape'
        ];
        let isScrapingAllowed = false;
        for (const link of tosLinks) {
            await page.goto(link, { waitUntil: 'networkidle2' });
            const tosText = await page.evaluate(() => document.body.innerText.toLowerCase());
            disallowTerms.forEach(term => {
                if (tosText.includes(term)) {
                    isScrapingAllowed = false;
                    return; // Exit loop early if a disallow term is found
                }
            });
            if (!isScrapingAllowed) {
                allowTerms.forEach(term => {
                    if (tosText.includes(term)) {
                        isScrapingAllowed = true;
                        return; // Exit loop early if an allow term is found
                    }
                });
            }
        }
        await browser.close();
        // Step 6: Write the formatted summary to a file
        const determination = isScrapingAllowed ? "Scraping is allowed" : "Scraping is not allowed";
        const summaryContent = [
            `Evaluating terms of service for ${url}`,
            `\nDetermination: ${determination}`,
            `\nResources:`,
            ...summaryLines
        ].join('\n');
        if (shouldWriteFiles) {
            fs.writeFileSync('output/summary.txt', summaryContent);
        }
        return determination;
    }
    catch (error) {
        console.error('Error checking ToS:', error);
        return 'Could not determine scraping permissions';
    }
}
// Example usage
// checkScrapingPermission('https://wikipedia.org').then(console.log);
