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
export function processAlphavantageApiResponse(responseData) {
  const { ticker } = responseData;
  const { response } = responseData;

  return Object.keys(response).map((date) => ({
    id: `${ticker}-${date}`,
    ticker,
    date,
    price: response[date]['4. close'],
  }));
}

/**
 * Method to process the raw API response into an array of prices for dates
 *
 * @param {object.<string, module:AlphaVantageData.AlphaVantageApiResponse>} responseData - An
 * API response for a given ticker
 * @param {number} limitAmount - The amount of to limit the API response to
 * @returns {object.<string, module:AlphaVantageData.AlphaVantageApiResponse>} An api response
 * with a limited amount of price data items
 */
export function limitAlphaVantageApiResponse(responseData, limitAmount) {
  const { ticker } = responseData;
  const { response } = responseData;

  const priceSeries = Object.keys(response)
    .slice(0, limitAmount)
    .reduce((acc, date) => {
      acc[date] = response[date];
      return acc;
    }, {});

  return {
    ticker,
    response: priceSeries,
  };
}
