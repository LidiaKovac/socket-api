import axios from "axios"
import { Router } from "express"
import jwt from "jsonwebtoken"
import { io } from "../../server.js"
import User from "../users/user.js"
import Room from "./room.js"
export const roomRouter = Router()
roomRouter.get("/all", async (req, res, next) => {
  try {
    let rooms = await Room.findAll()
    if (rooms) {
      res.send(rooms)
    } else res.statusCode(404)
  } catch (error) {
    next(error)
  }
})

roomRouter.put("/:id", async (req, res, next) => {
  try {
    let rooms = await Room.update(
      { name: req.body.name },
      { where: { id: req.params.id } }
    )
    if (rooms) {
      res.send(rooms)
    } else res.statusCode(404)
  } catch (error) {
    next(error)
  }
})


roomRouter.post("/", async (req, res, next) => {
  try {
    let rooms = await Room.create({name: req.body.name})
    if (rooms) {
      res.send(rooms)
    } else res.statusCode(404)
  } catch (error) {
    next(error)
  }
})
