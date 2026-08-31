const { app } = require('@azure/functions');

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

        const options = new chrome.Options();

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
