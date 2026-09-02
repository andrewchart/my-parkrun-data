const { app } = require('@azure/functions');

const { execSync } = require('child_process');

const { Builder, Browser, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')

const Parkrun = require('../model/Parkrun.js');

const { MPD_PARKRUNNER_URL } = process.env;

app.http('fetchParkrunData', {
    methods: ['GET'],
    authLevel: 'anonymous',
// app.timer('fetchParkrunData', {
//     schedule: '0 0 17 * * 6',
    handler: async (myTimer, context) => {
        context.log('Timer function processed request.');

        diagnostic('which google-chrome', context);
        diagnostic('which google-chrome-stable', context);
        diagnostic('which chromium', context);
        diagnostic('which chromium-browser', context);
        diagnostic('which chromedriver', context);

        diagnostic('google-chrome --version', context);
        diagnostic('chromium --version', context);
        diagnostic('chromedriver --version', context);

        const options = new chrome.Options();
    
        const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';

        options.addArguments('--headless', `user-agent=${ua}`);

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        try {

            await driver.get(MPD_PARKRUNNER_URL);

            let allRuns = await driver.findElements(By.xpath('(//table[@id="results"])[3]/tbody/tr'));

            let results = [];

            for(let run of allRuns) {
                let runData = [];
                let cols = await run.findElements(By.css('td'));
                for(let col of cols) {
                    runData.push(await col.getText());
                }
                results.push(new Parkrun(...runData));
            }

            return {
                body: JSON.stringify({ message: 'OK', results }),
                status: 200
            }

        } catch(err) {
            context.log(err);
        } finally {
            await driver.quit();
        }
    }
});

 function diagnostic(command, context) {
    try {
        context.log(`$ ${command}`);
        context.log(execSync(command, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        }));
    } catch (e) {
        context.log(`FAILED: ${command}`);
        context.log(e.stdout?.toString());
        context.log(e.stderr?.toString());
        context.log(e.message);
    }
}