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

        let parkruns = [];
        let data = await tableService.listEntities({
            queryOptions: { select: ['event','run_date','run_number','pos','time','age_grade','pb'] }
        });

        for await (const parkrun of data) {
            delete parkrun.etag;
            parkruns.push(parkrun);
        }

        let response = {
            body: JSON.stringify({ message: 'OK', parkruns }),
            status: 200
        }

        return response;
    }
});
