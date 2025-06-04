import mongoose from 'mongoose';

const botMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    isBot: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const BotMessage = mongoose.model('BotMessage', botMessageSchema);
export default BotMessage;