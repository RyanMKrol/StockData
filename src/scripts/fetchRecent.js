import {
  pipeline, pipelineClosureMethod, DynamoPersistanceQueue, sleep,
} from 'noodle-utils';

import { fetchIndexTickers, fetchTickerPriceData } from '../fetch';
import { processAlphavantageApiResponse, limitAlphaVantageApiResponse } from '../process';

import dynamoCredentials from '../../credentials/dynamo.json';

// storing the most recent 30 items
const NUM_PRICE_ITEMS_TO_STORE = 30;

const MINUTES_BETWEEN_QUEUE_PUSHES = 1;
const MS_IN_M = 60000;

/**
 * The method to run our program
 *
 * @returns {void} Nothing
 *
 */
async function main() {
  const queue = new DynamoPersistanceQueue(dynamoCredentials);
  const tickers = await fetchIndexTickers();

  for (let index = 0; index < tickers.length; index += 1) {
    const ticker = tickers[index];

    // fetch price data for the given ticker
    const data = await pipeline(
      fetchTickerPriceData,
      pipelineClosureMethod(limitAlphaVantageApiResponse, NUM_PRICE_ITEMS_TO_STORE),
      processAlphavantageApiResponse,
    )(ticker);

    // push the price data to our processing queue
    queue.pushBatch(data);

    // wait, so that we don't burn through the API limits
    await sleep(MINUTES_BETWEEN_QUEUE_PUSHES * MS_IN_M);
  }
}

main();
