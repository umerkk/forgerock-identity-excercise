import { Roles } from '../services/users/types/Roles';
import UsersModel from '../services/users/model/UsersModel';
import Logger from './Logger';

export async function seedInitialData() {
  Logger.info('Seeding initial data...');
  const data = await UsersModel.find({});
  if (data.length !== 0) {
    return;
  }
  const admin = new UsersModel({
    firstName: 'John',
    lastName: 'Doe',
    email: 'johnDoe@gmail.com',
    password: '123456',
    role: Roles.ADMIN,
    manager: null,
  });

  const supervisor = new UsersModel({
    firstName: 'Supervisor',
    lastName: 'Ellen',
    email: 'ellen@gmail.com',
    password: '123456',
    role: Roles.SUPERVISOR,
    manager: admin._id,
  });

  const user1 = new UsersModel({
    firstName: 'David',
    lastName: 'Ashley',
    email: 'ash@gmail.com',
    password: '123456',
    role: Roles.USER,
    manager: supervisor._id,
  });

  const user2 = new UsersModel({
    firstName: 'Mike',
    lastName: 'Wagner',
    email: 'mwagner@gmail.com',
    password: '123456',
    role: Roles.USER,
    manager: supervisor._id,
  });

  await admin.save();
  await supervisor.save();
  await user1.save();
  await user2.save();
  Logger.info('Seeding completed...');
}
