# Welcome to ForgeRock User REST Api

This API is a POC for a ForgerRock User API backend system. The project consists of the following

- Express based REST API

# Technology Used

The project is written in Typescript and using the following frameworks

- NodeJS, ExpressJS
- MongoDB & Mongoose (ODM)

# Development

In order to run the project locally, the project contains all the packages that it need, so there is
no need to install any other global package.

### Prerequisites

- NodeJS version >= 12.0

### Running Locally

After you checkout the project, on the root of the project, run

`npm install`

it'll install all necessary dependencies including Typescript, mongoose etc.

This'll make the project ready for the REST API.

#### Database

For testing purposes, the Cloud MongoDB instance is running and the credentials can be found in
`src/common/Secrets/` file. You can use those credentials with Mongo Compass application to browse
the data inside the database.

The application also seeds some initial users for the testing purposes.

#### Business Logic

The API fulfills all the contract outlined in the initial interview document. In addition to that,
there are few extra considerations made .

##### Removing a user

When removing a user, if the User being removed is a manager and has some direct reports, the
workflow would then:

- Reassign all the User's direct reports to its manager
- Remove the user from the database.

In this way of balancing the users tree, the employees are never left into a state without a manager
(Unless the user did not had a manager)

### Logs

The REST API server is going to emit logs once it is running either in production or development
environment. A separate folder called `logs` will be created at the `root` of the the project with
the following files.

- `Combined.log` - A combined file that consists of all the logs emitted by the server (severity
  based on the environment)
- `Debug.log` - Debugging logs emitted by the server - only available when running outside the
  production environment)
- `Error.log`- Errors occurred during the runtime.

## API Documentation

The example & usage of the API has been documented as part of POSTMAN collection, you can view them
at https://documenter.getpostman.com/view/4066746/UVksLZdR
