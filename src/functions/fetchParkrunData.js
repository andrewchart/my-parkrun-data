const { app } = require('@azure/functions');

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

        try {

            const results = [];

            const options = {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36',
                }
            };

            let res = await fetch(MPD_PARKRUNNER_URL, options);

            context.log(res);

            if(!res.ok) {
                return {
                    body: JSON.stringify({ message: res.statusText }),
                    status: res.status
                }
            }

            let html = await res.text();

            context.log(res.status);

            const xpath = '(//table[@id="results"])[3]/tbody';
            const container = `::-p-xpath(${xpath})`;
            const runs = `::-p-xpath(${xpath}/tr)`

            return {
                body: JSON.stringify({ message: 'OK', results }),
                status: 200
            }

        } catch(err) {
            context.log(err);
        }
    }
});
