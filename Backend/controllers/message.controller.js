import FriendRequest from '../model/friendRequest.model.js'
import Message from '../model/message.model.js'
import cloudinary from '../utils/cloudinary.js'
import { io, userSocketMap } from '../utils/socket.js'
import { Readable } from 'stream';
import multer from 'multer';
import { generateResponse } from '../utils/chatbot.js';

const upload = multer({ storage: multer.memoryStorage() });
const uploadMiddleware = upload.single('image');


async function handleGetUsersWithLastMessage(req, res) {
    try {
        const currentUser = req.user.id;

        const requests = await FriendRequest.find({
            status: 'accepted',
            $or: [
                { sender: currentUser },
                { receiver: currentUser }
            ]
        }).populate('sender receiver');

        let friendsWithLastMessage = await Promise.all(
            requests.map(async (request) => {
                const friend = request.sender._id.equals(currentUser)
                    ? request.receiver
                    : request.sender;

                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: currentUser, receiverId: friend._id },
                        { senderId: friend._id, receiverId: currentUser }
                    ],
                    deletedFor: { $ne: currentUser }
                })
                    .select('text image createdAt senderId receiverId isRead')
                    .sort({ createdAt: -1 })
                    .limit(1);

                const unreadMessages = {}
                const messages = await Message.find({
                    senderId: currentUser, receiverId: friend._id, isRead: false
                })
                if (messages.length > 0) unreadMessages[friend._id] = messages.length

                return {
                    _id: friend._id,
                    username: friend.username,
                    profilePic: friend.profilePic,
                    bio: friend.bio,
                    createdAt: friend.createdAt,
                    lastMessage: lastMessage ? {
                        _id: lastMessage._id,
                        text: lastMessage.text,
                        image: lastMessage.image,
                        createdAt: lastMessage.createdAt,
                        senderId: lastMessage.senderId,
                        receiverId: lastMessage.receiverId,
                        isRead: lastMessage.isRead
                    } : null,
                    unreadMessages
                };
            })
        );

        friendsWithLastMessage = friendsWithLastMessage.sort((a, b) => {
            const timeA = new Date(a.lastMessage?.createdAt || 0);
            const timeB = new Date(b.lastMessage?.createdAt || 0);
            return timeB - timeA;
        });

        res.status(200).json(friendsWithLastMessage);
    } catch (error) {
        console.error("Error in handleGetUsersWithLastMessage:", error.message);
        res.status(500).json({ message: "Failed to get users", error: error.message });
    }
}



async function handleGetMessages(req, res) {
    try {
        const receiverId = req.params.id;
        const senderId = req.user.id;
        const SILVI_SENDER_ID = "6842b8a6618e1a35636297a1";

        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId },
                {
                    senderId: SILVI_SENDER_ID,
                    $or: [
                        { receiverId: senderId },
                        { receiverId: receiverId }
                    ],
                    isSilviChat: true
                }
            ],
            deletedFor: { $ne: senderId }
        }).sort({ createdAt: 1 });

        await Message.updateMany(
            {
                senderId: receiverId,
                receiverId: senderId,
                deletedFor: { $ne: senderId }
            },
            { isRead: true }
        );

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to get messages", error: error.message });
    }
}

async function handleMessageAsRead(req, res) {
    try {
        const id = req.params.id
        await Message.findByAndUpdate(id, { isRead: true })
        res.status(200).json({ message: 'Messages is read successfully' })
    } catch (error) {
        res.status(500).json({ message: "Failed to read messages", error: error.message });
    }
}

async function handleSendMessage(req, res) {
    try {
        const receiverId = req.params.id;
        const senderId = req.user.id;
        const SILVI_SENDER_ID = "6842b8a6618e1a35636297a1";
        let imageUrl;
        if (req.file) {
            const bufferStream = Readable.from(req.file.buffer);

            imageUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'Images' },
                    (err, result) => {
                        if (err) return reject(err);
                        resolve(result.secure_url);
                    }
                );
                bufferStream.pipe(stream);
            });
        }

        const aiIsPresentInMessage = req.body.text.includes("@Silvi");
        const currentMessageIsSilviChat = aiIsPresentInMessage;
        const newMessage = new Message({
            senderId,
            receiverId,
            text: req.body.text,
            image: imageUrl,
            isSilviChat: currentMessageIsSilviChat
        });

        await newMessage.save();

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) io.to(receiverSocketId).emit('newMessage', newMessage);

        if (aiIsPresentInMessage) {
            const prompt = req.body.text.replace("@silvi", "").trim();
            const conversationHistoryFromDB = await Message.find({
                isSilviChat: true,
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: SILVI_SENDER_ID, receiverId: senderId },
                    { senderId: SILVI_SENDER_ID, receiverId: senderId },
                    { senderId: SILVI_SENDER_ID, receiverId: receiverId }
                ]
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .exec();

            const formattedChatHistoryForAI = conversationHistoryFromDB.map(msg => {
                return {
                    text: msg.text,
                    isBot: msg.isSilvi || (msg.senderId?.toString() === SILVI_SENDER_ID?.toString())
                };
            });

            formattedChatHistoryForAI.push({
                text: prompt,
                isBot: false
            });

            const response = await generateResponse(formattedChatHistoryForAI, req.user.username);
            const aiMessage = new Message({
                senderId: SILVI_SENDER_ID,
                receiverId: receiverId,
                text: response,
                isSilvi: true,
                isSilviChat: true
            });

            await aiMessage.save();

            io.to(receiverSocketId).emit('newMessage', aiMessage);
            io.to(userSocketMap[senderId]).emit('newMessage', aiMessage);
        }

        res.status(200).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: "Failed to send message", error: error.message });
        console.log(error);
    }
}

async function clearChat(req, res) {
    try {
        const userId = req.params.id;
        const currentUserId = req.user.id;

        await Message.updateMany(
            {
                $or: [
                    { senderId: currentUserId, receiverId: userId },
                    { senderId: userId, receiverId: currentUserId }
                ]
            },
            {
                $addToSet: { deletedFor: currentUserId }
            }
        );

        res.status(200).json({ message: "Chat cleared successfully" });
    } catch (error) {
        console.error("Clear chat error:", error);
        res.status(500).json({ message: "Failed to clear chat" });
    }
}

export {
    handleGetUsersWithLastMessage,
    handleGetMessages,
    handleSendMessage,
    uploadMiddleware,
    clearChat,
    handleMessageAsRead
}