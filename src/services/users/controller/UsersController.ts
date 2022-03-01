import { Request, Response } from 'express';
import User from '../types/User';
import UsersDAL from '../dal/UsersDal';
import Logger from '../../../utils/Logger';
import { Roles } from '../types/Roles';

/**
 * Controller class for the Users endpoints.
 */
export default class UsersController {
  /**
   * Select a single user from the database against the provided ID.
   * This function will atmost return one User object.
   * @param _ - Request object of the incoming HTTP Request
   * @param res - Response object of the incoming HTTP Request
   * @returns - User object.
   *          - Error object
   */
  public static async getUserById(
    _: Request,
    res: Response,
  ): Promise<Response<User | string> | undefined> {
    try {
      const _id = (_.params.id as string) || (_.user as User)._id?.toString();
      const isViewable = UsersController.calculateModificationPolicy(_.user as User, _id as string);

      if (!isViewable) {
        return res.status(403).json('Unauthorized');
      }

      const result = await UsersDAL.getOne(_id as string);
      res.json(result);
    } catch (err) {
      Logger.error(`Error: ${_.route} ${JSON.stringify(err)}`);
      return res.status(500).json(`Error: There was an error retrieving the user.`);
    }
  }

  /**
   * Update a single user against the given input schema.
   * This function will return the new object.
   * @param _ - Request object of the incoming HTTP Request
   * @param res - Response object of the incoming HTTP Request
   * @returns - User object.
   *          - Error object
   */
  public static async updateUserById(
    _: Request,
    res: Response,
  ): Promise<Response<User | string> | undefined> {
    try {
      const _id = _.params.id.toString() || (_.user as User)._id?.toString();
      const isEditable = UsersController.calculateModificationPolicy(_.user as User, _id as string);

      if (!isEditable) {
        return res.status(403).json('Unauthorized');
      }

      // Construct the difference between the old and new user
      const userObject = await UsersDAL.getOne(_id as string);
      // Do not allow to change password using this method. Password changes should be dealt with the /auth/change-password endpoint.
      delete _.body.password;

      const result = await userObject?.updateOne(_.body as User);
      res.status(200).json({ status: 'success' });
    } catch (err) {
      Logger.error(`Error: ${_.route} ${JSON.stringify(err)}`);
      return res.status(500).json(`Error: There was an error updating the user.`);
    }
  }

  /**
   * Add a new user into the database.
   * @param _ - Request object of the incoming HTTP Request.
   *              The body contains the User object (Already validated by the validation layer)
   * @param res - Response object of the incoming HTTP Request
   * @returns - General success response
   *          - Error object
   */
  public static async addUser(_: Request, res: Response): Promise<Response<string> | undefined> {
    try {
      const itemToAdd = _.body as User;
      await UsersDAL.addNewUser(itemToAdd);
      res.status(200).json({ status: 'success' });
    } catch (err) {
      Logger.error(`Error: ${_.route} ${JSON.stringify(err)}`);
      return res.status(500).json(`Error: There was an error adding the user.`);
    }
  }

  /**
   * Delete a User from the database.
   * @param _ - Request object of the incoming HTTP Request.
   *              The parameter contains the Mongo.ObjectID (primary key) that needs to be deleted.
   * @param res - Response object of the incoming HTTP Request
   * @returns - General success response
   *          - Error object
   */
  public static async deleteUser(_: Request, res: Response): Promise<Response<string> | undefined> {
    try {
      const userProfile = await UsersDAL.getOne(_.params.id as string);
      if (!userProfile) {
        return res.status(404).json(`Error: User not found.`);
      }

      // Balance the directReports tree of the manager
      await UsersController.balanceDirectReportsOnRemoval(userProfile);

      const result = await UsersDAL.deleteUser(_.params.id as string);
      if (!result) {
        throw new Error('User not found');
      }
      res.status(200).json({ status: 'success' });
    } catch (err) {
      Logger.error(`Error: ${_.route} ${JSON.stringify(err)}`);
      return res.status(500).json(`Error: There was an error deleting the user.`);
    }
  }

  /**
   * Balance the direct reports of the user that is being removed.
   * It will move the direct reports of the user to the manager of the user that is being removed.
   * @param userProfile - UserProfile that is being removed
   * @returns - Void / Exception
   */
  private static async balanceDirectReportsOnRemoval(userProfile: User): Promise<void> {
    if (!userProfile.manager) {
      return;
    }

    const newManagerId = (userProfile.manager as User)?.id;

    if (userProfile.directReports) {
      const directReportsProfilesFn = userProfile.directReports.map((directReport) =>
        UsersDAL.getOne(directReport.id),
      );
      const directReportsProfiles = await Promise.all(directReportsProfilesFn);
      for (const directReport of directReportsProfiles) {
        if (directReport) {
          directReport.manager = newManagerId;
          await directReport.save();
        }
      }
    }
  }

  /**
   * Calculate the modification policy for the user.
   * @param userProfile - UserProfile that is being removed.
   * @param _id - ID of the user under consideration.
   * @returns - Boolean
   */
  private static calculateModificationPolicy(userProfile: User, id: string): boolean {
    // Limit the query to authorized list only i.e. Me or my direct subordinates
    const isEditable =
      userProfile.role === Roles.ADMIN ||
      id === userProfile._id?.toString() ||
      userProfile.directReports?.some((directReport) => directReport.id === id);
    return isEditable;
  }
}
