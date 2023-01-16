import Repository from './baseRepo.js';

export class EventRepository extends Repository {
  constructor() {
    super('events');
  }

  async getListOfEvents() {
    try {
      const list = [];
      const result = await this.findAll();
      result.forEach((doc) => {
        list.push(doc._id);
      });
      return list;
    } catch (err) {
      return [];
    }
  }

  async deletePhotos(id, photos) {
    try {
      const event = await this.findById(id);
      event.photos = event.photos.filter((photo) => !photos.includes(photo));
      await this.update(event);
      return true;
    } catch (err) {
      return false;
    }
  }
}

export default new EventRepository();
