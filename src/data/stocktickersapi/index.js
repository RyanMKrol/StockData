/**
 * @module StockTickersApiData
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://stocktickersapi.xyz/api/tickers';
const DEFAULT_INDEX = 'ftse_350';

/**
 * @typedef StockTickersApiResponse
 * @type {Array.<string>}
 */

/**
 *
 * @param {string} index - The stock index that we're fetching the tickers for
 * @returns {StockTickersApiResponse} An array of tickers in the given index
 *
 */
async function fetchIndexTickers(index) {
  const url = buildApiUrl(index);

  return fetch(url)
    .then((res) => res.json())
    .then((resJson) => {
      validateApiResponse(resJson);
      return resJson;
    })
    .catch((err) => {
      throw err;
    });
}

/**
 *
 * @param {string} index - The stock index that we're fetching the tickers for
 * @returns {string} The URL of the API we use to fetch the index tickers
 *
 */
function buildApiUrl(index) {
  const urlIndex = index || DEFAULT_INDEX;
  const url = `${BASE_URL}/${urlIndex}`;

  process.stdout.write(`Using stocktickersapi URL: ${url}\n`);

  return url;
}

/**
 *
 * @param {StockTickersApiResponse} response - The API containing our tickers
 * @returns {void} Nothing
 *
 */
function validateApiResponse(response) {
  if (!response) {
    throw new Error('Could not validate the stocktickersapi response');
  }
}

export default fetchIndexTickers;
