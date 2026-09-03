const { app } = require('@azure/functions');

const puppeteer = require("puppeteer");

const Parkrun = require('../model/Parkrun.js');

const { MPD_PARKRUNNER_URL } = process.env;

app.http('fetchParkrunData', {
    methods: ['GET'],
    authLevel: 'anonymous',
// app.timer('fetchParkrunData', {
//     schedule: '0 0 17 * * 6',
    handler: async (myTimer, context) => {
        context.log('Timer function processed request.');

        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();

        try {

            await page.goto(MPD_PARKRUNNER_URL, { waitUntil: 'domcontentloaded' });

            const xpath = '(//table[@id="results"])[3]/tbody';
            const container = `::-p-xpath(${xpath})`;
            const runs = `::-p-xpath(${xpath}/tr)`

            await page.locator(container).waitHandle();

            const allRunsData = await page.$$eval(`${runs}`, runs => {
                
                let allRunsData = []

                runs.forEach(run => {
                    let thisRunData=[];
                    run.childNodes.forEach(td => thisRunData.push(td.innerText));
                    allRunsData.push(thisRunData);
                });

                return allRunsData;
            });

            const results = allRunsData.map((runData) => new Parkrun(...runData));

            return {
                body: JSON.stringify({ message: 'OK', results }),
                status: 200
            }

        } catch(err) {
            context.log(err);
        } finally {
            browser.close();
        }
    }
});


