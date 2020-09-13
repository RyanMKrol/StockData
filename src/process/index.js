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
 * @param {object.<string, module:AlphaVantageData.AlphaVantageApiResponse>} responseData - An
 * API response for a given ticker
 * @returns {Array.<StockTickerData>} An array of prices for dates of a given ticker
 */
export default function processAlphavantageApiResponse(responseData) {
  const { ticker } = responseData;
  const { response } = responseData;

  const priceSeries = response['Time Series (Daily)'];

  return Object.keys(priceSeries).map((date) => ({
    id: `${ticker}-${date}`,
    ticker,
    date,
    price: priceSeries[date]['4. close'],
  }));
}
