import fetch from 'node-fetch'

const URL = 'http://stocktickersapi.xyz/api/tickers/ftse_350'

async function fetchIndexTickers(): Promise<Array<string>> {
  return fetch(URL)
    .then((res: any) => {
      return res.json()
    })
    .then((resJson: any) => {
      validateApiResponse(resJson)
      return resJson
    })
    .catch((err: any) => {
      throw err
    })
}


function validateApiResponse(response: any): void {
  if (
    !response
  ) {
    throw new Error('Could not validate the stocktickersapi response')
  }
}

export {
  fetchIndexTickers
}
