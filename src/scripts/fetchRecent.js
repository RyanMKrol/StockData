import MailSender from 'noodle-email';
import {
  pipeline, pipelineClosureMethod, DynamoPersistanceQueue, sleep,
} from 'noodle-utils';
import schedule from 'node-schedule';

import { fetchIndexTickers, fetchTickerPriceData } from '../fetch';
import { processAlphavantageApiResponse, limitAlphaVantageApiResponse } from '../process';

import gmailCredentials from '../../credentials/gmail.json';
import dynamoCredentials from '../../credentials/dynamo.json';

// storing the most recent 30 items
const NUM_PRICE_ITEMS_TO_STORE = 30;

const MINUTES_BETWEEN_QUEUE_PUSHES = 1;
const MS_IN_M = 60000;

const mailClient = new MailSender(gmailCredentials);
mailClient.setFrom('"StockDataUpdater" <ryankrol.m@gmail.com>');
mailClient.setTo('ryankrol.m@gmail.com');

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

schedule.scheduleJob('0 0 12 * * *', async () => {
  try {
    await mailClient.sendMail('StockDataUpdater Started!', '');
    await main();
    await mailClient.sendMail('StockDataUpdater Finished!', '');
  } catch (error) {
    await mailClient.sendMail('StockDataUpdater Failed!', error.toString());
  }
});
