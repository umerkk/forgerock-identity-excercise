import { VerifiedCallback, VerifyCallback } from 'passport-jwt';
import UsersDAL from '../../../services/users/dal/UsersDal';
import Logger from '../../../utils/Logger';

const JWT_API_STRATEGY: VerifyCallback = async (jwtPayload: any, done: VerifiedCallback) => {
  try {
    const userCandidate = await UsersDAL.getOne(jwtPayload.id);
    if (!userCandidate) {
      return done('User Not Found', false);
    }

    const { password, ...sanitizedUserObject } = userCandidate.toJSON();
    return done(null, sanitizedUserObject);
  } catch (err) {
    Logger.error(`Error in LocalApiStrategy: ${JSON.stringify(err)}`);
    return done(err);
  }
};

export default JWT_API_STRATEGY;
