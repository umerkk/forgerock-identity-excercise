import Mongoose from 'mongoose';
import Logger from '../../utils/Logger';
import { Secrets } from '../secrets/Secrets';

export default class DatabaseAdapter {
  // Unique data structure to hold db connections
  private static connections: Map<string, Mongoose.Connection> = new Map();

  // Establishes a default connection to MongoDB server.
  // The implementation can be extended to support multiple connections for services & replica sets with Read/Write concerns.
  public static async init(): Promise<void> {
    try {
      const defaultConnection = await Mongoose.connect(
        // Use ENV variables to source the connection URL on Production
        // AND
        // Use the default connection URL on Development
        process.env.NODE_ENV === 'production' ? (process.env.DB_URL as string) : Secrets.MONGO_URL,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          poolSize: 3,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 60000,
          keepAlive: true,
          loggerLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
        },
      );
      this.connections.set('default', defaultConnection.connection);
      Logger.info(`Default database connection established....`);
    } catch (error) {
      Logger.error(`Unable to esablish default connection with the database: ${error}`);
      throw error;
    }

    // Register for error events (Support multiple connections)
    this.connections.forEach((conn) => {
      conn.on('error', (err) => {
        Logger.error(
          `Database connection fails for connection ${conn.id} - ${conn.host}. Error: ${err}`,
        );
        conn.close(true);
      });
    });
  }

  /**
   * Returns a mongodb connection for a specific service/alias
   *
   * @param alias connection user-friendly name
   * @returns returns a Mongoose.Connection for db operations OR undefined if not found.
   */
  public static getConnectionByName(alias: string): Mongoose.Connection | undefined {
    return this.connections.get(alias);
  }
}
