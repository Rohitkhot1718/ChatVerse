import http from 'http'
import { Server } from 'socket.io'
import express from 'express'

const app = express()
const server = http.createServer(app)

const allowedOrigins = [
  "http://localhost:5173",
  "https://chatverse-g8zt.onrender.com"
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
    }
})

const userSocketMap = {}

io.on('connection', (socket) => {
    console.log('User connected', socket.id)

    const userId = socket.handshake.query.userId
    if (userId) userSocketMap[userId] = socket.id

    io.emit('online', Object.keys(userSocketMap))

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id)
        delete userSocketMap[userId]
        io.emit('online', Object.keys(userSocketMap))
    })
})

export { app, server, io, userSocketMap }