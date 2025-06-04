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
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PORT = process.env.PORT || 3001

dotenv.config()
MongoDBConnection()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// CORS configuration for production and development
const allowedOrigins = [
  process.env.FRONTEND_URL, // Your Render app URL
  "http://localhost:5173",  // Local development
  "http://localhost:3000"   // Alternative local port
].filter(Boolean) // Remove undefined values

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

// API routes - these must come BEFORE static file serving
app.use('/api/auth', authRouter)
app.use('/api/messages', messageRouter)
app.use('/api/contact', contactRouter)
app.use('/api/friend-request', friendRequestRouter)
app.use('/api/chatbot', chatbotRouter)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  })
})

// Serve static files from the React app build
const buildPath = path.join(__dirname, 'client', 'dist')
const indexPath = path.join(buildPath, 'index.html')

console.log('Looking for frontend build at:', buildPath)

if (fs.existsSync(buildPath) && fs.existsSync(indexPath)) {
  console.log('✅ Frontend build found, serving static files')
  
  // Serve static files
  app.use(express.static(buildPath))
  
  // Handle React routing - send all non-API requests to React app
  // Use a more specific pattern to avoid path-to-regexp issues
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err)
        res.status(500).send('Error loading the application')
      }
    })
  })
} else {
  console.log('❌ Frontend build not found at:', buildPath)
  console.log('Available files in current directory:', fs.readdirSync(__dirname))
  
  // Fallback route when no frontend build is available
  app.get('/', (req, res) => {
    res.json({
      message: 'ChatVerse API Server',
      status: 'Running (Backend Only)',
      note: 'Frontend build not found. Run build process to include frontend.',
      buildPath: buildPath,
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        messages: '/api/messages',
        contacts: '/api/contact',
        friendRequests: '/api/friend-request',
        chatbot: '/api/chatbot'
      }
    })
  })
  
  // Handle undefined routes with regex pattern to avoid path-to-regexp errors
  app.get(/^(?!\/api).*/, (req, res) => {
    res.status(404).json({ error: 'Frontend not available' })
  })
}

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})