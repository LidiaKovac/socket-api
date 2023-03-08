import express from "express"
import { config } from "dotenv"
import endpoints from "express-list-endpoints"
import cors from "cors"
import { sequelize } from "./config/db.js"
import { createServer } from "http"
import { Server } from "socket.io"
import { roomRouter } from "./services/rooms/index.js"
import { userRouter } from "./services/users/index.js"
import Message from "./services/messages/message.js"
import Room from "./services/rooms/room.js"
config()
const PORT = process.env.PORT || 3001

const app = express()
const httpServer = createServer(app)
const onlineUsers = []
class User {
  constructor(linkedinId, socketId, roomId) {
    this.linkedinId = linkedinId
    this.socketId = socketId
    this.roomId = roomId
  }
}
export const io = new Server(httpServer)
io.on("connection", async (socket) => {
  console.log("connected")
  socket.emit("welcome", { msg: "ok" })
  socket.on("setIdentity", async (payload) => {
    try {
      //when the user connects, BE should keep track of socketId + linkedin id
      let room = await Room.findByPk(payload.roomId)
      if (room) {
          console.log("room found");
        onlineUsers.push(new User(payload.id, socket.id, room.id))
        console.log(room.id)
        socket.join(room.name)
      } else {
        console.log("room not found");

        let newRoom = await Room.create(
          { name: "new pippo room" },
          { raw: false }
        )
        onlineUsers.push(new User(payload.id, socket.id, newRoom.id))
        socket.join(newRoom.name)
        console.log(newRoom.id)
      }
    } catch (error) {
      console.log(error)
    }
  })
  socket.on("sendMsg", async (payload) => {
    let newMessage = await Message.create({
      content: payload.msg,
      RoomId: payload.room,
      sender: payload.sender,
    })
    let room = await Room.findByPk(payload.RoomId, { raw: false })
    console.log(room)
    socket.to(room.name).emit("message", newMessage)
  })
  //*connect to previous conversations
  //socket on sendMessage
  //socket disconnect
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
