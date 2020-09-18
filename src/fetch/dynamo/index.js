import async from 'async';
import DynamoDBWrapper from 'noodle-dynamo';
import { sleep } from 'noodle-utils';

import credentials from '../../../credentials/dynamo.json';

// The ID in the database will be TICKER_ID-DATE, so I need a constant date
// to check to determine if the database has data for this ticker or not
const ID_DATE_HANDLE = '2020-07-27';

// RCUs available for this table
const DYNAMO_READ_CAPACITY_LIMIT = 4;

// ms it takes to spend 1 RCU
const MS_PER_RCU = 1000;

const dynamoDbClient = new DynamoDBWrapper(credentials, 'us-east-2');

/**
 * @param {string} ticker The ticker to build an ID for
 * @returns {string} The ID to query the database with
 */
function getDatabaseId(ticker) {
  return `${ticker}-${ID_DATE_HANDLE}`;
}

/**
 * @typedef DynamoDbResponse
 * @type {object}
 * @property {Array.<object>} Items The item returned from the query
 * @property {number} Count The number of items matching the query
 * @property {number} ScannedCount The number of items scanned from the query
 */

/**
 * @param {string} ticker The ticker to query the database with
 * @returns {DynamoDbResponse} The response from the database
 */
async function readTickerData(ticker) {
  const tickerId = getDatabaseId(ticker);

  const table = 'TickerData';
  const expression = 'id = :tickerId';
  const expressionData = {
    ':tickerId': tickerId,
  };

  return dynamoDbClient.readTable(table, expression, expressionData);
}

/**
 * @param {Array.<string>} tickers The tickers to filter through
 * @returns {Array.<string>} The tickers needing still data
 */
export default async function fetchTickersNeedingData(tickers) {
  const eligibleTickers = (
    await async.mapLimit(tickers, DYNAMO_READ_CAPACITY_LIMIT, async (ticker) => {
      const tickerData = await readTickerData(ticker);

      await sleep(MS_PER_RCU);

      return tickerData.Count === 0 ? ticker : undefined;
    })
  ).filter((x) => x);

  return eligibleTickers;
}
