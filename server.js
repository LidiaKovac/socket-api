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
import axios from "axios"
config()
const PORT = process.env.PORT || 3001

const app = express()
const httpServer = createServer(app)
const onlineUsers = new Set()
const auth = async (token) => {
  let { status, statusText, data } = await axios.get(
    "https://striveschool-api.herokuapp.com/api/profile/me",
    {
      headers: {
        Authorization: token,
      },
    }
  )
  let linkedInProfile
  if (status !== 200) {
    throw (
      "Your key is probably wrong, but here is the actual error:" + statusText
    )
  }
  //looking in our db
  else {
    linkedInProfile = await User.findOne({
      where: {
        linkedinId: data._id,
      },
    })
    //if we don't find anything
    if (!linkedInProfile) {
      linkedInProfile = await User.create({
        first_name: data.name,
        last_name: data.surname,
        linkedinId: data._id,
        linkedinProPic: data.image,
      })
    }
  }

  return { status, statusText, linkedInProfile }
}
export const io = new Server(httpServer)
io.on("connection", async (socket) => {
  console.log("connected")
  socket.on("setIdentity", async (payload) => {
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
  socket.on("sendMsg", async (payload) => {
    try {
      let { status, statusText, linkedInProfile } = await auth(payload.token)
      console.log(status)
      if (status == 200) {
        let newMessage = await Message.create({
          content: payload.msg,
          RoomId: payload.room,
          UserId: linkedInProfile.id,
        })

        let user = await User.findByPk(linkedInProfile.id)
        let room = await Room.findByPk(payload.room, { raw: true })

        console.log(room)
        io.to(room.name).emit("message", {
          ...newMessage.dataValues,
          User: user,
        })
      }
    } catch (error) {
      console.log(error)
    }
  })
  //*connect to previous conversations
  //socket on sendMessage
  //socket disconnect
  socket.on("joinRoom", async ({ id, token }) => {
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
            console.log("room found")
            console.log("joining", room.name)
            socket.join(room.name)
            socket.broadcast.emit("joined", { msgs })
          } else {
            console.log("room not found")
            // //se non trova una stanza con quell'id, ne crea una nuova
            // let newRoom = await Room.create(
            //   { name: "new pippo room" },
            //   { plain: true }
            // )
            //dopo aver creato la nuova stanza pusha su onlineUsers
            // onlineUsers.push(new User(payload.id, socket.id, newRoom.id))
            // socket.join(newRoom.name) //entra nella stanza
            // console.log(newRoom.id)
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
