import DynamoDBWrapper from 'noodle-dynamo'
import dynamoCredentials from './../../../credentials/dynamo.json'

const dynamoDb = new DynamoDBWrapper(dynamoCredentials)

export function readTable(ticker: string) {
  const table = 'TickerData'
  const expression = 'ticker = :ticker'
  const expressionData = {
    ':ticker': ticker,
  }

  return dynamoDb.readTable(table, expression, expressionData)
}

export function writeTable(ticker: string, priceData: any) {
  const tableName = 'TickerData'
  const insertItem = {
    'ticker': ticker,
    'priceData': priceData,
  }

  return dynamoDb.writeTable(tableName, insertItem)
}
