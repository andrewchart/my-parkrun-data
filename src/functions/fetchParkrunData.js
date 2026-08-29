const { app } = require('@azure/functions');

app.timer('fetchParkrunData', {
    schedule: '0 0 17 * * 6',
    handler: (myTimer, context) => {
        context.log('Timer function processed request.');
    }
});
