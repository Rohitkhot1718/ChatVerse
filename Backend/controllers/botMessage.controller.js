import BotMessage from '../model/botMessage.model.js';
import { generateResponse } from '../utils/chatbot.js';


export async function handleBotMessage(req, res) {
    try {
        const { chatHistory } = req.body;
        const userId = req.user.id;

        const currentUserPromptMessage = chatHistory[chatHistory.length - 1];

        if (
            !currentUserPromptMessage ||
            currentUserPromptMessage.isBot ||
            currentUserPromptMessage.senderId !== userId.toString()
        ) {
            console.warn("Invalid or missing current user prompt in chat history.");
            return res.status(400).json({ message: "Invalid chat history provided." });
        }

        const userMessageText = currentUserPromptMessage.text;

        const userMessage = await BotMessage.create({
            userId,
            text: userMessageText,
            isBot: false
        });

        const botResponse = await generateResponse(chatHistory, req.user.username);

        const botMessage = await BotMessage.create({
            userId,
            text: botResponse,
            isBot: true
        });

        res.status(200).json({
            userMessage,
            botMessage
        });
    } catch (error) {
        console.error('Bot message error:', error);
        res.status(500).json({
            message: "Failed to process message",
            error: error.message
        });
    }
}

export async function getBotMessages(req, res) {
    try {
        const messages = await BotMessage.find({
            userId: req.user.id
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get messages",
            error: error.message
        });
    }
}

export async function clearBotChat(req, res) {
    try {
        const userId = req.user.id;
        await BotMessage.deleteMany({ userId });
        res.status(200).json({ message: "Bot chat cleared successfully" });
    } catch (error) {
        console.error("Clear bot chat error:", error);
        res.status(500).json({ message: "Failed to clear bot chat" });
    }
}