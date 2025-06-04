import express from 'express'
import restrictSignIn from '../middlewares/auth.js'
import { handleGetUsersWithLastMessage, handleGetMessages, handleSendMessage, uploadMiddleware, clearChat, handleMessageAsRead } from '../controllers/message.controller.js'

const router = express.Router()

router.get('/getUsers', restrictSignIn, handleGetUsersWithLastMessage)
router.get('/:id', restrictSignIn, handleGetMessages)
router.post('/:id', restrictSignIn, uploadMiddleware, handleSendMessage)
router.delete('/clear/:id', restrictSignIn, clearChat);
router.put('/read/:id', restrictSignIn, handleMessageAsRead)

export default router