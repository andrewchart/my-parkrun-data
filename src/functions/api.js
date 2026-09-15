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
            queryOptions: { 
                select: ['event','run_date','run_number','pos','time','age_grade','pb'],
                filter: constructFilter(request.params)
            }
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


/**
 * Constructs a string to be used as filter condition/s when querying the data table
 * 
 * @param   {Array}  params All GET params supplied in the http request
 * @returns {String}        String containing query conditions to filter the table by
 */
function constructFilter(params) {

    const { from, to } = params;

    let filterQueryParts = [];
    
    // Return runs from this date onwards
    if( validateFilterParamDate(from) ) {
        filterQueryParts.push(`run_date ge datetime'${from}T00:00:00.000'`);
    }
  
    // Returns runs up to and including this date
    if( validateFilterParamDate(to) ) {
        filterQueryParts.push(`run_date le datetime'${to}T23:59:59.999'`);
    }

    if(filterQueryParts.length > 0) {
        return filterQueryParts.join(' and ');
    } else {
        return null;
    }

}

/**
 * Validates the date parameters supplied in the API GET request
 * 
 * @param   {String}  dateString  String expected to represent a date from the query param
 * @returns {Boolean}             True if the date matches the format YYYY-MM-DD
 */
function validateFilterParamDate(dateString) {
    const datePattern = new RegExp("^2[0-9]{3}-[0-1][0-9]-[0-3][0-9]$");
    return datePattern.test(dateString);
}