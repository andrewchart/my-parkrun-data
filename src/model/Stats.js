const { TableClient } = require("@azure/data-tables");
const { DefaultAzureCredential } = require("@azure/identity");

const {
    AZ_API_STATS_TABLE_NAME,
    AZ_TABLE_STORAGE_URL
} = process.env;

const tableService = new TableClient(
    AZ_TABLE_STORAGE_URL, 
    AZ_API_STATS_TABLE_NAME, 
    new DefaultAzureCredential()
);

function Stats() {
    return this;
}

async function getStat(name) {
    try {
        let result = await tableService.getEntity('stat', name.toString());
        return result.value;
    } catch (err) {
        return null;
    }
}

async function setStat(name, value) {
    name = name.toString();

    let stat = {
        partitionKey: 'stat',
        rowKey: name, 
        value: value
    }

    tableService.upsertEntity(stat, "Replace");
}

module.exports = {
    Stats,
    getStat,
    setStat
}