import axios from "axios"
import { Router } from "express"
import jwt from "jsonwebtoken"
import { io } from "../../server.js"
import User from "../users/user.js"
export const userRouter = Router()
userRouter.post("/login", async (req, res, next) => {
  try {
    let linkedInProfile = await User.findOne({
      where: {
        linkedinId: req.body.email,
      },
    })
    if (linkedInProfile) {
      res.send(linkedInProfile)
    } else {
      let allProfs = await axios.get(
        "https://striveschool-api.herokuapp.com/api/profile",
        {
          headers: {
            Authorization: process.env.LINKEDIN_KEY,
          },
        }
      )
      let linkedInProfile = allProfs.data.find(
        (prof) => prof.email === req.body.email
      )
      if (linkedInProfile < 0) res.sendStatus(404)
      else {
        let newUser = await User.create({
          first_name: linkedInProfile.name,
          last_name: linkedInProfile.surname,
          linkedinId: linkedInProfile._id,
          linkedInProPic: linkedInProfile.image || null,
        })
        res.send(newUser)
      }
    }
  } catch (error) {
    next(error)
  }
})
