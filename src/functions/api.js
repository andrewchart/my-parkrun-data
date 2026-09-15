const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");
const { DefaultAzureCredential } = require("@azure/identity");

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

        let results = [];
        let parkruns = await tableService.listEntities();

        for await (const parkrun of parkruns) {
            results.push(parkrun);
        }

        let response = {
            body: JSON.stringify({ message: 'OK', results }),
            status: 200
        }

        return response;
    }
});
