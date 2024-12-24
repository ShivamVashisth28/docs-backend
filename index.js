import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './db/db.js'
import userRouter from './routes/user.router.js'
import documentRouter from './routes/document.router.js'
import cookieParser from 'cookie-parser'

const app = express()

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

app.listen(port, ()=> {
    console.log(`App started listening at port ${port}`)
})