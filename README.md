# StockDataUpdater

This tool is responsible for fetching raw stock data; currently historic daily prices.

Three technologies are used to achieve this:

- [StockTickersAPI](https://github.com/RyanMKrol/StockIndexTickersAPI) - fetches the tickers we want to store data for.
- [AlphaVantage](https://www.alphavantage.co/) - provides the raw stock data
- Dynamo - stores the stock data

This job runs every day and keeps all of my stock data up to date! Currently this data is only used on my [stock data site](http://stockpricedataapi.xyz/) (just heatmaps for now)

[![Build Status](https://travis-ci.org/RyanMKrol/StockDataUpdater.svg?branch=master)](https://travis-ci.org/RyanMKrol/StockDataUpdater)
