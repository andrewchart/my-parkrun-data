const { app } = require('@azure/functions');

const puppeteer = require("puppeteer");

const Parkrun = require('../model/Parkrun.js');

const { MPD_PARKRUNNER_URL } = process.env;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.http('fetchParkrunData', {
    methods: ['GET'],
    authLevel: 'anonymous',
// app.timer('fetchParkrunData', {
//     schedule: '0 0 17 * * 6',
    handler: async (myTimer, context) => {
        context.log('Timer function processed request.');

        const browser = await puppeteer.launch({headless: true}); 
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36');

        try {

            await page.goto(MPD_PARKRUNNER_URL, { waitUntil: 'domcontentloaded' });

            // const xpath = '(//table[@id="results"])[3]/tbody';
            // const container = `::-p-xpath(${xpath})`;
            // const runs = `::-p-xpath(${xpath}/tr)`

            //await page.locator(container).waitHandle();

            const results = await page.$eval('html', el => el.outerHTML);

            // const allRunsData = await page.$$eval(`${runs}`, runs => {
                
            //     let allRunsData = []

            //     runs.forEach(run => {
            //         let thisRunData=[];
            //         run.childNodes.forEach(td => thisRunData.push(td.innerText));
            //         allRunsData.push(thisRunData);
            //     });

            //     return allRunsData;
            // });

            // const results = allRunsData.map((runData) => new Parkrun(...runData));

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


