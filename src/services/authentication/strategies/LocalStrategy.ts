import { VerifyFunction } from 'passport-local';
import UsersDAL from '../../../services/users/dal/UsersDal';
import Logger from '../../../utils/Logger';

const LOCAL_API_STRATEGY: VerifyFunction = async (username, pwd, done) => {
  try {
    const userCandidate = await UsersDAL.getOneByEmail(username);
    if (!userCandidate) {
      return done(null, false);
    }
    const isPasswordValid = await userCandidate.verifyPassword(pwd);
    if (!isPasswordValid) {
      return done(null, false);
    }
    const { password, ...sanitizedUserObject } = userCandidate.toJSON();
    return done(null, sanitizedUserObject);
  } catch (err) {
    Logger.error(`Error in LocalApiStrategy: ${JSON.stringify(err)}`);
    return done(err);
  }
};

export default LOCAL_API_STRATEGY;
