import { Application, NextFunction, Request, Response } from 'express';
import { BaseRoute } from '../../../common/routes/BaseRoute';
import Passport from 'passport';
import JsonWebToken from 'jsonwebtoken';
import User from '../../../services/users/types/User';
import { Secrets } from '../../../common/secrets/Secrets';
import { loginValidator } from '../../../services/users/validator/OtherEndpointValidators';

export default class AuthRoute extends BaseRoute {
  constructor(expressApp: Application) {
    super(expressApp, 'AuthenticationRoute');
  }

  /**
   * HTTP endpoints & their handlers.
   * Each endpoint must first pass the Validation defined for each endpoint.
   * Then only the request is passed to its controller.
   */
  registerRoutes() {
    this.app
      .route('/login')
      .post(loginValidator, (_: Request, res: Response, next: NextFunction) => {
        Passport.authenticate('local', (err, user: User) => {
          if (err || !user) {
            return res.status(404).json({
              message: 'Something doesnt add up. try again',
            });
          } else {
            const token = JsonWebToken.sign(user, Secrets.JWT_SECRET, {
              expiresIn: '2h',
              algorithm: 'HS256',
              issuer: 'ForgeRock',
            });
            res.json({ token });
          }
        })(_, res, next);
      });
  }
}
