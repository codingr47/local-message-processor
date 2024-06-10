import { USERS_REVENUE_REPOSITORY } from "lib/consts";
import UsersRevenue from "../entities/usersRevenue.entity";

export const usersRevenueProviders = [
  {
    provide: USERS_REVENUE_REPOSITORY,
    useValue: UsersRevenue,
  },
];