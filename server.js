import express from "express"
import { config } from "dotenv"
import endpoints from "express-list-endpoints"
import cors from "cors"
config()
const PORT = process.env.PORT || 3001

const app = express()

app.use(express.json())
app.use(cors())

app.listen(PORT, () => {
  console.log(
    "🌚🌝 Server is running on",
    PORT,
    " with these endpoints: ",
    
  )
  console.table(endpoints(app))
})
export default app

app.get("/api", (req, res) => {
  res.send("ok")
})
