const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");

const Parkrun = require('../model/Parkrun.js');

const {
    getStat,
    setStat
} = require('../model/Stats.js');

const {
    AZ_API_DATA_TABLE_NAME,
    AZ_JSON_BLOB_STORAGE_NAME,
    AZ_JSON_BLOB_STORAGE_URL,
    AZ_TABLE_STORAGE_URL
} = process.env;

app.timer('populateData', {
    schedule: '0 0 19 * * 6',
    handler: async (myTimer, context) => {
        try {
            return populateTableFromJson(context);
        } catch (err) {
            context.log(err);
        }
    }
});


/**
 * Initiates the processes to write new Parkrun data to Azure storage.
 * 
 * @param   {Object}  context   Function runtime context 
 * @returns {Integer}           0 if successful
 */
async function populateTableFromJson(context) {

    const creds = new DefaultAzureCredential();
    
    // 1. Fetch the data from the most recent json file
    let runs = await getLatestData(creds, context);

    // 2. Write runs to table
    let writeCount = await writeRuns(runs, creds, context);

    context.log(`Finished: Wrote ${writeCount} new runs to table storage.`);

    return 0;

}

/**
 * Turns all the raw run data in the most recent JSON file in blob storage into
 * a JS object.
 * 
 * @param   {TokenCredential} creds Azure credential to authenticate to Storage
 * @returns {Array}                 Raw data for all runs in the json file
 */
async function getLatestData(creds) {

    const blobService = new BlobServiceClient(
        AZ_JSON_BLOB_STORAGE_URL, 
        creds
    );

    const blobContainer = blobService.getContainerClient(AZ_JSON_BLOB_STORAGE_NAME);

    let blobs = await blobContainer.listBlobsByHierarchy('/');
    let files = [];

    for await (const blob of blobs) {
        files.push(blob);
    }

    let latestFile = files.sort().slice(-1)[0].name; // Assumes filenames are datetime 
                                                     // stamps which are chronological 
                                                     // when ordered as strings.

    let download = await blobContainer.getBlobClient(latestFile).downloadToBuffer();

    return JSON.parse(download.toString());

}

/**
 * Writes run data to Azure Table Storage for later recall via the API.
 * 
 * @param   {Array}           runs  Array of objects representing raw Parkrun data
 * @param   {TokenCredential} creds Azure credential to authenticate to Storage
 * @returns {Integer}               Number of Table entries upserted
 */
async function writeRuns(runs, creds) {

    const tableService = new TableClient(
        AZ_TABLE_STORAGE_URL, 
        AZ_API_DATA_TABLE_NAME, 
        creds
    );

    let runNum = runs.length;
    let highestId = await getStat('highest-id') || 0;
    let results = [];

    // Set a new highestId
    setStat('highest-id', runNum);

    // Write only the runs that are not yet in the table
    for(let i = 0; runNum - i > highestId; i++) {

        let run = new Parkrun(
            runs[i].event,
            runs[i].run_date,
            runs[i].run_number,
            runs[i].pos,
            runs[i].time,
            runs[i].age_grade,
            runs[i].pb
        );

        results.push(tableService.upsertEntity({ 
            partitionKey: 'run', 
            rowKey: (runNum - i).toString().padStart(4, "0"), 
            ...run
        }, "Replace"));

    };

    return Promise.all(results).then((results) => {
        return results.length;
    });
    
}