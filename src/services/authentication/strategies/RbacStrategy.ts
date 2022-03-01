import { NextFunction, Request, Response } from 'express';
import User from '../../../services/users/types/User';
import { Roles } from '../../../services/users/types/Roles';

export default class RBACStrategy {
  public static adminRestrictedRoute(_: Request, res: Response, next: NextFunction) {
    const user = _.user as User;
    if (user.role === Roles.ADMIN) {
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  }
}
