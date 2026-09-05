const { app } = require('@azure/functions');

const https = require('node:https');
const { exec } = require('child_process');

const Parkrun = require('../model/Parkrun.js');

const { MPD_PARKRUNNER_URL } = process.env;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.http('fetchParkrunData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
// app.timer('fetchParkrunData', {
//     schedule: '0 0 17 * * 6',
//     handler: async (myTimer, context) => {


        // Setup
        const { mode } = request.params;

        const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';

        const options = {
            method: 'GET',
            headers: {
                'User-Agent': ua,
            }
        };

        // Exec
        try {

            if(mode === 'fetch') {
                context.log("Mode is fetch");
                let res = await fetch(MPD_PARKRUNNER_URL, options);
                if(!res.ok) {
                    return {
                        body: JSON.stringify({ message: res.statusText }),
                        status: res.status
                    }
                }

                let html = await res.text();

                return {
                    body: JSON.stringify({ message: 'OK', data: [html] }),
                    status: 200
                }
            } 

            else if(mode === 'https') {
                context.log("Mode is https");
                let res = await getRawDataHttps(MPD_PARKRUNNER_URL, options);
                return {
                    body: JSON.stringify({ message: res.statusMessage, data: res.html }),
                    status: res.statusCode
                }
            }

            else if(mode === 'curl') {
                context.log("Mode is curl");
                let res = await getRawDataCurl(MPD_PARKRUNNER_URL, ua);
                return {
                    body: JSON.stringify({ message: "cURL mode", data: res }),
                    status: 200
                }
            }

            else {
                return {
                    body: JSON.stringify({ message: 'A valid mode parameter is required' }),
                    status: 400
                }
            }

            //const results = [];
            // const xpath = '(//table[@id="results"])[3]/tbody';
            // const container = `::-p-xpath(${xpath})`;
            // const runs = `::-p-xpath(${xpath}/tr)`

            // return {
            //     body: JSON.stringify({ message: 'OK', results }),
            //     status: 200
            // }

        } catch(err) {
            context.log(err);
        }
    }
});

async function getRawDataHttps(url, options) {
    return new Promise((resolve) => {
        let html = '';

        https.get(url, options, res => {
            res.on('data', chunk => { html += chunk });

            res.on('end', () => {
               resolve({ statusCode: res.statusCode, statusMessage: res.statusMessage, html });
            });
        });
    });
}

async function getRawDataCurl(url, ua) {
    return new Promise((resolve) => {

        exec(`curl -s ${url} -H "User-Agent: ${ua}"`, (error, stdout, stderr) => {
            resolve(stdout);
        });

    });
}