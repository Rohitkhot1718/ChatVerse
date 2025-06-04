import mongoose from 'mongoose'

const messageSchema = mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    text: { type: String },
    image: { type: String },
    isRead: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
},
    { timestamps: true }
)

export default mongoose.model('message', messageSchema)