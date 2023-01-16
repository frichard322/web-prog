import mongodb from 'mongodb';
import mongoConnection from './mongo.js';

export default class Repository {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.connect().catch((err) => console.log('Error: '.concat(err)));
  }

  async connect() {
    this.collection = await mongoConnection.collection(this.collectionName);
    if (this.collectionName === 'users') {
      this.collection.createIndex({ name: 1 }, { unique: true });
    }
  }

  async findAll(projection = {}) {
    return this.collection.find({}, { projection }).toArray();
  }

  async findById(id, projection = {}) {
    return this.collection.findOne({ _id: new mongodb.ObjectId(id) }, { projection });
  }

  async create(document) {
    const result = await this.collection.insertOne(document);
    return {
      ...document,
      _id: result.insertedId,
    };
  }

  async update(document) {
    await this.collection.updateOne({ _id: document._id }, { $set: document });
    return document;
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: new mongodb.ObjectId(id) });
    return result.deletedCount > 0;
  }

  async deleteAll() {
    const result = await this.collection.deleteMany({});
    return result.deletedCount > 0;
  }
}
