
import { Sequelize } from "sequelize-typescript";
import UsersRevenue from '../entities/usersRevenue.entity';

export const databaseProviders = [
  {
    provide: "SEQUELIZE",
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: "postgres",
        host: process.env.DB_HOST,
        port: 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      sequelize.addModels([UsersRevenue]);
      await sequelize.sync();
      return sequelize;
    },
  },
];