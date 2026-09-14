const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");
const { DefaultAzureCredential } = require("@azure/identity");

const Parkrun = require('../model/Parkrun.js');

const {
    AZ_API_DATA_TABLE_NAME,
    AZ_TABLE_STORAGE_URL
} = process.env;

app.http('parkruns', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        const tableService = new TableClient(
            AZ_TABLE_STORAGE_URL, 
            AZ_API_DATA_TABLE_NAME, 
            new DefaultAzureCredential()
        );

        let parkruns = [];
        let rawData = await tableService.listEntities();

        for await (const pr of rawData) {
            parkruns.push(new Parkrun(
                pr.event,
                pr.run_date,
                pr.run_number,
                pr.pos,
                pr.time,
                pr.age_grade,
                pr.pb
            ));
        }

        let response = {
            body: JSON.stringify({ message: 'OK', parkruns }),
            status: 200
        }

        return response;
    }
});
