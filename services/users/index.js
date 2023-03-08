import axios from "axios"
import { Router } from "express"
import jwt from "jsonwebtoken"
import { io } from "../../server.js"
import User from "../users/user.js"
export const userRouter = Router()
userRouter.post("/login", async (req, res, next) => {
  try {
    let key = req.headers["authorization"]
    let { status, statusText, data } = await axios.get(
      "https://striveschool-api.herokuapp.com/api/profile/me",
      {
        headers: {
          Authorization: key,
        },
      }
    )
    if (status !== 200)
      throw (
        "Your key is probably wrong, but here is the actual error:" + statusText
      )
    else {
      let linkedInProfile = await User.findOne({
        where: {
          linkedinId: data._id,
        },
      })
      if (!linkedInProfile) {
        let newProfile = await User.create({
          first_name: data.name,
          last_name: data.surname,
          linkedinId: data._id,
          linkedinProPic: data.image,
        })
        res.send(newProfile)
      } else res.send(linkedInProfile)
    }
  } catch (error) {
    next(error)
  }
})
