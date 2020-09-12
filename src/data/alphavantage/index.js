/**
 * @module AlphaVantageData
 */

import fetch from 'node-fetch';

import credentials from '../../../credentials/alphavantage.json';

const BASE_URL = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=full';

/**
 * @typedef AlphaVantageApiResponse
 * @type {object}
 * @property {TickerMetaData} metaData - The meta data relating to the API response
 * @property {TickerDataPriceSeries} timeSeries - The meta data relating to the API response
 */

/**
 * @typedef TickerMetaData
 * @type {object}
 * @property {string} information - String detailing what data we have.
 * @property {string} symbol - The ticker's key.
 * @property {string} lastRefreshed - Date the data was last refreshed.
 * @property {string} outputSize - Type of API response.
 * @property {string} timeZone - The time zone.
 */

/**
 * @typedef TickerDataPriceSeries
 * @type {object}
 * @property {object.<string, TickerPriceData>} timeSeriesDaily - An
 *  object containing all the price data
 */

/**
 * @typedef TickerPriceData
 * @type {object}
 * @property {string} open - The open price for the day
 * @property {string} high - The highest price for the day
 * @property {string} low - The lowest price for the day
 * @property {string} close -  The closing price for the day
 * @property {string} volume - The volume for the day
 */

/**
 * Method to fetch the historic price data for a given ticker
 *
 * @param {string} ticker - The ticker, e.g. GAW.L
 * @returns {AlphaVantageApiResponse} An object representing price data
 */
async function fetchTickerPriceData(ticker) {
  const url = buildApiUrl(ticker);

  return fetch(url)
    .then((res) => res.json())
    .then((resJson) => {
      validateApiResponse(resJson);
      return resJson;
    })
    .catch(() => undefined);
}

/**
 * Method to build the API we'll call for the price data
 *
 * @param {string} ticker - The ticker, e.g. GAW.L
 * @returns {string} The URL to fetch price data with
 */
function buildApiUrl(ticker) {
  const apiKey = credentials.key;
  const url = `${BASE_URL}&apikey=${apiKey}&symbol=${ticker}`;

  process.stdout.write(`Using AlphaVantage URL: ${url}\n`);

  return url;
}

/**
 * Method to validate the price data API response
 *
 * @param {AlphaVantageApiResponse} response - The initial API response
 * @returns {void} Nothing
 */
function validateApiResponse(response) {
  if (!response || response['Error Message']) {
    throw new Error('Could not validate the AlphaVantage response');
  }
}

export default fetchTickerPriceData;
