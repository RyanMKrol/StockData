import schedule from 'node-schedule'
import async from 'async'
import MailSender from 'noodlemail'

import gmailCredentials from './../credentials/gmail.json'
import { fetchIndexTickers } from './api/stocktickersapi'
import { fetchTickerPriceData } from './api/alphavantage'
import { processAlphavantageApiResponse } from './process'
import { writeTable } from './api/aws'
import { wait } from './utils'

// time is adjusted based on MAX_CONCURRENT_REQUESTS to ensure we're under 5 per minute (api Limit)
const SECONDS_WAIT = 15
const MS_IN_S = 1000

// requests are done one at a time to reduce the amount of writes per second going to dynamo
const MAX_CONCURRENT_REQUESTS = 1

//roughy 5 years of daily price movements
const MAX_SUPPORTED_DAYS = 550

const mailClient = new MailSender(gmailCredentials)
mailClient.setFrom('"StockData" <ryankrol.m@gmail.com>')
mailClient.setTo('ryankrol.m@gmail.com')

mailClient.sendMail('Mail client setup!', '')

schedule.scheduleJob('0 0 12 * * *', async () => {
  try {
    await mailClient.sendMail('Beginning stock data update!', '')

    // fetch the tickers for the index we want to get data for - in this case the FTSE 350
    const tickers = await fetchIndexTickers()

    // mapLimit args:
    //   * first is the items you want to iterate over
    //   * second is the number of concurrent requests you want to allow
    //   * third is the function to do with each item
    //   * fourth is the callback to call in the third argument to signify you're done
    await new Promise((resolve, reject) => {
      async.mapLimit(tickers, MAX_CONCURRENT_REQUESTS, async function(ticker: string, callback: Function) {
        try {
          const tickerData = await fetchTickerPriceData(ticker)

          // cut down the amount of items we need to write to the database. this is done
          // to reduce the amount of write capacity units i'm using per write
          const processedTickerData = processAlphavantageApiResponse(tickerData).slice(0, MAX_SUPPORTED_DAYS)

          await writeTable(ticker, processedTickerData)

          // wait to start next batch, API limits to 5 requests per 60s
          await wait(SECONDS_WAIT*MS_IN_S)

          callback()
        } catch (error) {
          const errorMessage =
            `Encountered an error when gathering data for ticker - ${ticker}, error = ${error.toString()}`
          await mailClient.sendMail('Encountered an error when updating stock data', errorMessage)
          callback()
        }
      }, (err: any, results: any) => {
        resolve()
      })
    })

    await mailClient.sendMail('Updated stock data for the day!', '')
  } catch (error) {
    await mailClient.sendMail('Could not update stock data for the day', error.toString())
  }
})
