import fetch from 'node-fetch';

const BASE_URL = 'http://stocktickersapi.xyz/api/tickers';
const DEFAULT_INDEX = 'ftse_350';

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

function buildApiUrl(index) {
  const urlIndex = index || DEFAULT_INDEX;
  const url = `${BASE_URL}/${urlIndex}`;

  process.stdout.write(`Using stocktickersapi URL: ${url}\n`);

  return url;
}

function validateApiResponse(response) {
  if (!response) {
    throw new Error('Could not validate the stocktickersapi response');
  }
}

export default fetchIndexTickers;
