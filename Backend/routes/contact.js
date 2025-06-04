import express from 'express'
import restrictSignIn from '../middlewares/auth.js'
import { handleAddContact, handleGetContacts } from '../controllers/contact.controller.js'

const router = express.Router()

router.post('/addContact', restrictSignIn, handleAddContact)
router.get('/displayContact', restrictSignIn, handleGetContacts)

export default router