import http from 'http'
import { Server } from 'socket.io'
import express from 'express'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'https://t2dh4c5x-5173.inc1.devtunnels.ms',
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