import Logger from '../../../utils/Logger';
import UsersModel from '../model/UsersModel';
import User from '../types/User';

export default class UsersDAL {
  private static model = UsersModel;

  public static async getOne(id: string): Promise<User | null> {
    return this.model.findById(id, { password: 0, createdAt: 0, updatedAt: 0 }).populate({
      path: 'manager directReports',
      select: { password: 0, createdAt: 0, updatedAt: 0 },
      model: UsersModel,
    });
  }
  public static async getOneByEmail(userEmail: string): Promise<User | null> {
    const p = this.model.findOne({ email: userEmail });
    return p;
  }

  public static async addNewUser(userObj: User): Promise<User | null> {
    return this.model.create(userObj);
  }

  public static async deleteUser(id: string): Promise<User | null> {
    return this.model.findByIdAndDelete(id);
  }

  public static async updateUser(id: string): Promise<User | null> {
    return this.model.findByIdAndDelete(id);
  }
}
