import mongodb from 'mongodb';
import config from '../config/config.js';

export class MongoConnection {
  constructor() {
    const { mongoUrl, mongoOptions } = config;
    this.client = new mongodb.MongoClient(mongoUrl, mongoOptions);
  }

  async init() {
    await this.client.connect();
    this.db = this.client.db('db_events');
  }

  async collection(name) {
    if (!this.db) {
      await this.init();
    }
    return this.db.collection(name);
  }
}

export default new MongoConnection();
