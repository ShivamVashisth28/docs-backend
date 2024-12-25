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
        origin:"http://localhost:5173",
        methods: ['GET','POST']
    }
})

dotenv.config({path:'./.env'})
app.use(cors({
    credentials:true,
    origin:'http://localhost:5173'
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

io.on("connection", socket => {
    socket.on("get-document", async documentId => {
      const doc = await Document.findOne({documentId})
      
      if(!doc){
        socket.emit("load-document", "")
      }else{
        
        socket.emit("load-document", doc.content)
      }
      socket.join(documentId)
  
      socket.on("send-changes", delta => {
        socket.broadcast.to(documentId).emit("receive-changes", delta)
      })
    })
  })



server.listen(port, ()=> {
    console.log(`Server started listening at port ${port}`)
})