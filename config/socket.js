import {Socket} from "socket.io"
export const initSocket = (server) => {
    const io = new Socket(server)
    io.on("connection", async(socket)=> {
        console.log("connected")
        
        //*connect to previous conversations
        //socket on sendMessage
        //socket disconnect

    })
}