import sizeof from 'sizeof';
import DynamoDBWrapper from 'noodle-dynamo';

import dynamoCredentials from '../../credentials/dynamo.json';
import SizeExceeded from '../errors';

// I only want my Dynamo table using 5 Write capacity units
// A WCU can be thought of as a 1K write
const PROVISIONED_WRITE_CAPACITY_UNITS = 5;

// Making this slightly over a second to give myself some
// buffer to not be right at the line of 5 WCU
const SINGLE_WRITE_CAPACITY_UNIT_TIME_MS = 1200;

// used to enforce the definition of a WCU, < 1kb per second
const MAX_WRITE_DATA_SIZE_BYTES = 1000;

const dynamoDb = new DynamoDBWrapper(dynamoCredentials, 'us-east-2');

export default class DynamoPersistanceQueue {
  constructor() {
    this.queue = [];
    // setup the event queue
    setInterval(async () => {
      await this.persistBatch();
    }, SINGLE_WRITE_CAPACITY_UNIT_TIME_MS);
  }

  push(item) {
    if (sizeof.sizeof(item) < MAX_WRITE_DATA_SIZE_BYTES) {
      this.queue.push(item);
    } else {
      throw new SizeExceeded();
    }
  }

  pushBatch(batch) {
    if (batch.some((x) => sizeof.sizeof(x) > MAX_WRITE_DATA_SIZE_BYTES)) {
      throw new SizeExceeded();
    }

    this.queue = this.queue.concat(batch);
  }

  async persistBatch() {
    if (this.queue.length > 0) {
      const batch = this.queue.splice(0, PROVISIONED_WRITE_CAPACITY_UNITS);

      batch.forEach(async (item) => {
        dynamoDb.writeTable('TickerData', item);
      });
    }
  }
}
