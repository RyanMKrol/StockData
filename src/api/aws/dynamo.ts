import AWS from 'aws-sdk'
import dynamoCredentials from './../../../credentials/dynamo.json'

AWS.config.update(dynamoCredentials)
AWS.config.update({
  region: 'us-east-2',
})

export function readTable(ticker: string) {
  const docClient = new AWS.DynamoDB.DocumentClient()

  const params = {
    TableName : 'TickerData',
    KeyConditionExpression: 'ticker = :ticker',
    ExpressionAttributeValues: {
      ':ticker': ticker
    }
  }

  return new Promise((resolve, reject) => {
    docClient.query(params, function(err: any, data: any) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

export function readWholeTable() {
  const docClient = new AWS.DynamoDB.DocumentClient()

  const params = {
    TableName : 'TickerData',
  }

  return new Promise((resolve, reject) => {
    docClient.scan(params, function(err: any, data: any) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

export function writeTable(ticker: string, priceData: any) {
  const docClient = new AWS.DynamoDB.DocumentClient()

  const params = {
    TableName: 'TickerData',
    Item: {
      'ticker': ticker,
      'priceData': priceData,
    }
  }

  return new Promise((resolve, reject) => {
    docClient.put(params, function(err: any, data: any) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
