import { Application } from 'express';
import AuthRoute from '../../services/authentication/routes/AuthRoute';
import UserRoute from '../../services/users/routes/UserRoute';
import { BaseRoute } from './BaseRoute';
import RootRoute from './RootRoute';

/**
 * Main file to register all the routes of the services created inside `services` folder.
 */
export default class ApplicationRoutes {
  public static appRoutes: BaseRoute[] = [];
  static init(expressApp: Application) {
    ApplicationRoutes.appRoutes.push(new RootRoute(expressApp));
    ApplicationRoutes.appRoutes.push(new UserRoute(expressApp));
    ApplicationRoutes.appRoutes.push(new AuthRoute(expressApp));
  }
}
