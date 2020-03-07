import fetch from 'node-fetch'

const BASE_URL = 'http://stocktickersapi.xyz/api/tickers'
const DEFAULT_INDEX = 'ftse_350'

async function fetchIndexTickers(index?: string): Promise<Array<string>> {
  const url = buildApiUrl(index)

  return fetch(url)
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

function buildApiUrl(
  index?: string
): string {
  const urlIndex = index || DEFAULT_INDEX
  const url = `${BASE_URL}/${urlIndex}`

  console.log(`Using stocktickersapi URL: ${url}`)

  return url
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
