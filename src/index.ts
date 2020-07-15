// import schedule from 'node-schedule'
import async from 'async'
import MailSender from 'noodle-email'

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

async function main() {
  try {
    console.log('starting')
    await mailClient.sendMail('Beginning stock data update!', '')

    // fetch the tickers for the index we want to get data for - in this case the FTSE 350
    const tickers = await fetchIndexTickers()

    console.log('got my tickers')
    console.log(tickers)
    const otherTickers = ['SMWH.L']
    console.log('doing a thing')
    // mapLimit args:
    //   * first is the items you want to iterate over
    //   * second is the number of concurrent requests you want to allow
    //   * third is the function to do with each item
    //   * fourth is the callback to call in the third argument to signify you're done
    await new Promise((resolve, reject) => {
      async.mapLimit(
        otherTickers,
        MAX_CONCURRENT_REQUESTS,
        async function(ticker: string, callback: Function) {
          try {
            console.log('fetching the ticker data, lets see how that goes')
            const tickerData = await fetchTickerPriceData(ticker)
            console.log('got some ticker data')
            // cut down the amount of items we need to write to the database. this is done
            // to reduce the amount of write capacity units i'm using per write
            console.log('processing the data')
            // console.log(tickerData)
            const processedTickerData = processAlphavantageApiResponse(
              tickerData
            ).slice(0, MAX_SUPPORTED_DAYS)
            console.log('writing to the table')
            await writeTable(ticker, processedTickerData)
            console.log('waiting to start the next guy')
            // wait to start next batch, API limits to 5 requests per 60s
            await wait(SECONDS_WAIT * MS_IN_S)

            callback()
          } catch (error) {
            console.log('we fucked this up!')
            const errorMessage = `Encountered an error when gathering data for ticker - ${ticker}, error = ${error.toString()}`
            await mailClient.sendMail(
              'Encountered an error when updating stock data',
              errorMessage
            )
            callback()
          }
        },
        (err: any, results: any) => {
          resolve()
        }
      )
    })
    console.log('finished with the update!')
    await mailClient.sendMail('Updated stock data for the day!', '')
  } catch (error) {
    console.log('fucked up the update!')
    console.log(error)
    await mailClient.sendMail(
      'Could not update stock data for the day',
      error.toString()
    )
  }
}

main()
