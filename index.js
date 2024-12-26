import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './db/db.js'
import userRouter from './routes/user.router.js'
import documentRouter from './routes/document.router.js'
import cookieParser from 'cookie-parser'

import { createServer, maxHeaderSize} from 'node:http'
import { Server } from 'socket.io'

import Document from './models/document.model.js'

const app = express()

const server = createServer(app)
const io = new Server(server, {
    cors:{
        origin:process.env.FRONTEND_URL,
        methods: ['GET','POST']
    }
})

dotenv.config({path:'./.env'})
app.use(cors({
    credentials:true,
    origin:process.env.FRONTEND_URL
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))

connectDB()

app.get("/", (req, res)=>{
    res.json({
        message:"backend of docs app"
    })
})

app.use('/user',userRouter)
app.use('/document',documentRouter)

const port = process.env.PORT || 3000


// socket io part

let users = []

io.on("connection", socket => {

    socket.on("get-document", async (documentId, userName) => {

      
      const doc = await Document.findOne({documentId})
      
      if(!doc){
        socket.emit("load-document", "")
      }else{
        
        socket.emit("load-document", doc.content)
      }
      socket.join(documentId)
      
      users.push({
        socketId: socket.id,
        documentId,
        userName,
      })
    
      io.to(documentId).emit("get-users", users)
   
      socket.on("cursor-position", ({ documentId, range, userName }) => {
        socket.broadcast.to(documentId).emit("cursor-position", { range, userName });
      });


      socket.on("send-changes", delta => {
          socket.broadcast.to(documentId).emit("receive-changes", delta)
        })
    })

    socket.on("disconnect", () => {

      const userEntry = users.find(user => user.socketId === socket.id);
      if (userEntry) {
        const docId = userEntry['documentId'];
        users = users.filter(user => user.socketId !== socket.id); // Fix filter logic
        io.to(docId).emit('get-users', users);
        socket.broadcast.to(docId).emit("user-disconnected", userEntry.userName);
      }

    })
  })



server.listen(port, ()=> {
    console.log(`Server started listening at port ${port}`)
})