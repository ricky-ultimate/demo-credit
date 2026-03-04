import knex from "knex";
import config from "../../knexfile";
import { ENV } from "../constants/env";

const db = knex(config[ENV.NODE_ENV]);

export default db;
