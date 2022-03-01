import { Application } from 'express';
import Passport from 'passport';
import RBACStrategy from '../../../services/authentication/strategies/RbacStrategy';
import { BaseRoute } from '../../../common/routes/BaseRoute';
import UsersController from '../controller/UsersController';
import { addUserValidator } from '../validator/AddUserValidator';

export default class UserRoute extends BaseRoute {
  constructor(expressApp: Application) {
    super(expressApp, 'UsersRoute');
  }

  /**
   * HTTP endpoints & their handlers.
   * Each endpoint must first pass the Validation defined for each endpoint.
   * Then only the request is passed to its controller.
   */
  registerRoutes() {
    this.app
      .route('/users')
      .post(
        Passport.authenticate('jwt', { session: false }),
        RBACStrategy.adminRestrictedRoute,
        addUserValidator,
        UsersController.addUser,
      )
      .get(Passport.authenticate('jwt', { session: false }), UsersController.getUserById);

    this.app
      .route('/users/:id')
      .get(Passport.authenticate('jwt', { session: false }), UsersController.getUserById)
      .put(Passport.authenticate('jwt', { session: false }), UsersController.updateUserById)
      .delete(
        Passport.authenticate('jwt', { session: false }),
        RBACStrategy.adminRestrictedRoute,
        UsersController.deleteUser,
      );
  }
}
