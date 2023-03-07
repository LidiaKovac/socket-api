import { Sequelize } from "sequelize"
import { config } from "dotenv"
config()

const { PG_DB } = process.env
export const sequelize = new Sequelize(PG_DB, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      required: true,
      rejectUnauthorized: false,
    },
  },
})
