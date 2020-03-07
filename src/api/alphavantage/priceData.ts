import fetch from 'node-fetch'

const BASE_URL = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=full'

import credentials from './../../../credentials/alphavantage.json'

async function fetchTickerPriceData(
  ticker: string,
): Promise<any> {
  const url = buildApiUrl(ticker)

  return fetch(url)
    .then((res: any) => {
      return res.json()
    })
    .then((resJson: any) => {
      validateApiResponse(resJson)
      return resJson
    })
    .catch((err: any) => {
      return undefined
    })
}

function buildApiUrl(
  ticker: string
): any {
  const apiKey = credentials.key
  const url = `${BASE_URL}&apikey=${apiKey}&symbol=${ticker}`

  console.log(`Using LastFM URL: ${url}`)

  return url
}

function validateApiResponse(response: any): void {
  if (
    !response ||
    response['Error Message']
  ) {
    throw new Error('Could not validate the AlphaVantage response')
  }
}

export {
  fetchTickerPriceData
}
