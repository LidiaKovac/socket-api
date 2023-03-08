import { Sequelize } from "sequelize"
import { config } from "dotenv"
import User from "../services/users/user.js"
import Room from "../services/rooms/room.js"
import Message from "../services/messages/message.js"
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

const models = [User, Room, Message]
models.forEach(mod => mod.initialize(sequelize))

User.belongsToMany(Room, {through: "room_user"})
Room.belongsToMany(User, {through: "room_user"})
Room.hasMany(Message)
Message.belongsTo(Room)
Message.belongsTo(User)
User.hasMany(Message)