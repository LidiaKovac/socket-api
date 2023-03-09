import express from "express"
import { config } from "dotenv"
import endpoints from "express-list-endpoints"
import User from "./services/users/user.js"
import cors from "cors"
import { sequelize } from "./config/db.js"
import { createServer } from "http"
import { Server } from "socket.io"
import { roomRouter } from "./services/rooms/index.js"
import { userRouter } from "./services/users/index.js"
import Message from "./services/messages/message.js"
import Room from "./services/rooms/room.js"
import { auth } from "./utils/linkedin.js"
import {
  joined,
  joinRoom,
  loggedIn,
  message,
  newUserHasLoggedIn,
  sendMsg,
  setIdentity,
} from "./utils/events.js" //file with all the events

config()
const PORT = process.env.PORT || 3001

const app = express()
const httpServer = createServer(app) //crea http server
const onlineUsers = new Set() //la lista degli utenti deve essere univoca (still testing?)

export const io = new Server(httpServer)
io.on("connection", async (socket) => {
  socket.on(setIdentity, async ({ token }) => {
    try {
      //looking in the linkedin db
      let { status, statusText, linkedInProfile } = await auth(payload.token)

      const rooms = await Room.findAll()
      onlineUsers.add(linkedInProfile)
      socket.emit("loggedIn", { onlineUsers: [...onlineUsers], rooms, me: linkedInProfile })
      //when the user connects, BE should keep track of socketId + linkedin id
      socket.broadcast.emit("newUserHasLoggedIn", { onlineUsers: [...onlineUsers] })

    } catch (error) {
      console.log(error)
    }
  })
  socket.on(sendMsg, async ({ token, room: toRoom, msg }) => {
    try {
      let { status, linkedInProfile } = await auth(token)
      if (status == 200) {
        let newMessage = await Message.create({
          content: msg,
          RoomId: toRoom,
          UserId: linkedInProfile.id,
        })

        let user = await User.findByPk(linkedInProfile.id, { raw: true }) //the logged in user
        let room = await Room.findByPk(toRoom, { raw: true })

        io.to(room.name).emit(message, {
          ...newMessage.dataValues,
          User: user,
        })
      }
    } catch (error) {
      console.log(error)
    }
  })
  socket.on(joinRoom, async ({ id, token }) => {
    try {
      let { status, statusText, linkedInProfile } = await auth(token)
      if (status == 200) {
        let room = await Room.findByPk(id)
        if (room) {
          let msgs = await Message.findAll({
            where: {
              RoomId: room.id,
            },
            raw: true,
            include: [User],
            nest: true,
          })
          if (room) {
            socket.join(room.name)
            socket.broadcast.emit("joined", { msgs })
          } else {
            throw "room not found"
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  })
})

io.on("connect-error", (err) => console.log(err))

app.use(express.json())
app.use(cors())

app.use("/api", userRouter)
app.use("/api", roomRouter)

sequelize.sync({ force: false, logging: false, alter: true }).then((result) => {
  httpServer.listen(PORT, () => {
    console.log("🌚🌝 Server is running on", PORT, " with these endpoints: ")
    console.table(endpoints(app))
  })
})
export default app
