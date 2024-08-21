# Terms of Service - Scraping Permissions

This repository can be used to search a website for its terms of service to determine whether or not the site allows automated scraping/data collection. This is a proof of concept. You should read the full terms of service to be sure you are not violating the rules of a website.

## Running Tests

To validate the functionality of the script, a test script has been included. The test script runs the `checkScrapingPermission` function against known sites that either allow or disallow scraping.

### Steps to Run the Tests:

1. Ensure that all dependencies are installed by running:
   ```
   npm install
   ```

2. Compile and run the tests:
   ```
   npm test
   ```

## Using the Script:
- In index.ts, you can edit the url of the website you would like to search, before running:
   ```
      npm start
   ```
- The output folder will store the results including the list of pages that were searched for terms of service. In the case that your site has more than 10 relevant pages, you may need to modify the page limit.

