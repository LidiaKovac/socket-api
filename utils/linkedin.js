import axios from "axios"
import User from "../services/users/user.js"
export const auth = async (token) => {
    //fa una fetch sull'api di linkedin, ritorna lo status e il profilo trovato (o creato) sul db
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