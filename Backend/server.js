import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import MongoDBConnection from './utils/config.js'
import authRouter from './routes/auth.js'
import messageRouter from './routes/message.js'
import contactRouter from './routes/contact.js'
import friendRequestRouter from './routes/friendRequest.js'
import chatbotRouter from './routes/chatbot.js'
import cors from 'cors'
import { app, server } from './utils/socket.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 3001

dotenv.config()
MongoDBConnection()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
  origin: ["https://chat-verse-g8iw.onrender.com", "http://localhost:5173"],
  credentials: true,
}))

app.use('/api/auth', authRouter)
app.use('/api/messages', messageRouter)
app.use('/api/contact', contactRouter)
app.use('/api/friend-request', friendRequestRouter)
app.use('/api/chatbot', chatbotRouter)

app.use(express.static(path.join(__dirname, 'client', 'dist')))

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"))
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
