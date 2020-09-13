# StockDataUpdater

## Overview

A tool to gather and persist stock data!

## Usage

### Fetching Everything

This script is run using:

`npm run start`

This script gathers all historic data for companies currently in the FTSE 350. This takes just over 3 days to complete due to the resource limitations I'm working with (explained below). Each company has roughly 3500 datapoints to store, and we can only store 5 items per 1.2 seconds (we could do per 1 second, but this puts us right at the resource limit; 5 per 1.2s works out at ~4.2 WCU).

Execution Time:

- 350 companies
- 3500 datapoints per company
- 350 \* 3500 = 1,225,000 datapoints Total
- 5 points can be stored at once
- 1,225,000 / 5 = 245,000 calls need to be made
- 245,000 \* 1.2 seconds = 294,000 seconds to store everything
- 294,000 / 60 / 60 / 24 = ~3.25 days

**This should only ever be used to initialise your DB with stock data up to today**

## Limitations

- AlphaVantageApi
  - 500 Calls per day
  - 5 Calls per minute
- DynamoDB
  - 5 Write Capacity Units (WCU)
  - 1 item of less than 1KB being stored per second, is 1 WCU
- StockTickersApi \* None
