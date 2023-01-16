import Repository from './baseRepo.js';

export class UserRepository extends Repository {
  constructor() {
    super('users');
  }

  async findOneByName(name) {
    return this.collection.findOne({ name }, {});
  }

  async getListOfOrganizers() {
    try {
      const list = [];
      const result = await this.findAll();
      result.forEach((doc) => {
        list.push(doc.name);
      });
      return list;
    } catch (err) {
      return [];
    }
  }

  async setRole(id, newRole) {
    try {
      const user = await this.findById(id);
      user.role = newRole;
      await this.update(user);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default new UserRepository();
