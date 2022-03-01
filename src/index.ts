import * as http from 'http';
import Express from 'express';
import Cors from 'cors';
import Helmet from 'helmet';
import Compression from 'compression';
import Passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import JwtStrategy from 'passport-jwt';
import Logger from './utils/Logger';
import ApplicationRoutes from './common/routes';
import { BaseRoute } from './common/routes/BaseRoute';
import DatabaseAdapter from './common/database/DatabaseAdapter';
import { LoggingMiddleware } from './middlewares/LoggingMiddleware';
import LOCAL_API_STRATEGY from './services/authentication/strategies/LocalStrategy';
import JWT_API_STRATEGY from './services/authentication/strategies/JWTStrategy';
import { Secrets } from './common/secrets/Secrets';
import { seedInitialData } from './utils/MongoDataSeeder';

// Core components instantiation
const APP = Express();
const SERVER: http.Server = http.createServer(APP);
const PORT = 8080; // default port to listen

(async () => {
  try {
    // Express Middlewars

    // Enable CORS for all origins - In prod, this needs to be configured with strict URLs.
    APP.use(
      Cors({
        methods: ['GET', 'POST'],
      }),
    );
    APP.use(LoggingMiddleware);
    APP.use(
      Helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            scriptSrc: ["'self'", "'unsafe-inline'"], // To allow same host ReactUI get static contents
          },
        },
      }),
    );
    APP.use(Compression());
    APP.use(Express.json());
    APP.use(Passport.initialize());

    // Passport Local Strategy
    Passport.use(new LocalStrategy(LOCAL_API_STRATEGY));
    Passport.use(
      new JwtStrategy.Strategy(
        {
          secretOrKey: Secrets.JWT_SECRET,
          jwtFromRequest: JwtStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
          issuer: 'ForgeRock',
        },
        JWT_API_STRATEGY,
      ),
    );

    // Bootstrapping sequence
    ApplicationRoutes.init(APP);
    await DatabaseAdapter.init();

    // Seed the database
    await seedInitialData();

    // start the Express server
    SERVER.listen(PORT, () => {
      ApplicationRoutes.appRoutes.forEach((route: BaseRoute) =>
        Logger.debug(`Route added for ${route.routeName}`),
      );
      Logger.info(`server started at http://localhost:${PORT}`);
    });
  } catch (e) {
    Logger.info(`Error occured while starting the server ${e}`);
  }
})();
