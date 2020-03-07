import {
  AlphavantageAPIResponse,
  StockPriceDataItemDictionary,
} from './../types'

export function processAlphavantageApiResponse(response: AlphavantageAPIResponse): Array<StockPriceDataItemDictionary> {
  const priceSeries: any = response['Time Series (Daily)']

  return Object.keys(priceSeries).map((key) => {
    return {
      date: key,
      priceData: priceSeries[key]['4. close'],
    }
  })
}
