import express from 'express'
import { handleSignUp, handleSignIn, handleSignOut, handleUpdateProfile, handleEmailVerification, handleForgotPassword, handleResetPassword, uploadMiddleware } from '../controllers/auth.controller.js'
import restrictSignIn from '../middlewares/auth.js'

const router = express.Router()

router.post('/signup', handleSignUp)
router.post('/signin', handleSignIn)
router.get('/signout', handleSignOut)

router.put('/updateProfile', restrictSignIn, uploadMiddleware, handleUpdateProfile)

router.get('/verify-email', handleEmailVerification)
router.post('/forgot-password', handleForgotPassword)
router.post('/reset-password', handleResetPassword)

export default router