/**
 * @module DataProcessing
 */

/**
 * @typedef StockTickerData
 * @type {object}
 * @property {string} date - The date of the corresponding price
 * @property {number} price - The price for the corresponding date
 */

/**
 * Method to process the raw API response into an array of prices for dates
 *
 * @param {module:AlphaVantageData.AlphaVantageApiResponse} apiResponse - An
 *  API response for a given ticker
 * @returns {Array.<StockTickerData>} An array of prices for dates of a given ticker
 */
export default function processAlphavantageApiResponse(apiResponse) {
  const priceSeries = apiResponse['Time Series (Daily)'];

  return Object.keys(priceSeries).map((key) => ({
    date: key,
    price: priceSeries[key]['4. close'],
  }));
}
