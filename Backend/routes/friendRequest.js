import express from 'express'
import restrictSignIn from '../middlewares/auth.js'
import {
    handleSendFriendRequest,
    handleGetRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleGetFriendStatus
} from '../controllers/friendRequest.controller.js'

const router = express.Router()

router.post('/send', restrictSignIn, handleSendFriendRequest)
router.get('/incoming', restrictSignIn, handleGetRequest)
router.post('/accept', restrictSignIn, handleAcceptFriendRequest)
router.post('/reject', restrictSignIn, handleRejectFriendRequest)
router.get('/status/:id', restrictSignIn, handleGetFriendStatus)

export default router