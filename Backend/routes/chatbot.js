import express from 'express';
import { handleBotMessage, getBotMessages, clearBotChat } from '../controllers/botMessage.controller.js';
import restrictSignIn from '../middlewares/auth.js';


const router = express.Router();

router.post('/message', restrictSignIn, handleBotMessage);
router.get('/messages', restrictSignIn, getBotMessages);
router.delete('/clear', restrictSignIn, clearBotChat);
export default router;