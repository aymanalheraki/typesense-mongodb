## Getting started

- Paste the json file containing the data to be processed in the `data_seed` folder.
- Make a `.env` file with the following:
  ```
  DATABASE_URI=mongodb://localhost:27017/?replicaSet=rs0
  ```
- Run `npm install` to install dependencies.
- Run `npm run seed` to seed the database.
- Run `npm run build:watch` to build the project.
- Run `npm run start:local` to start the server.
