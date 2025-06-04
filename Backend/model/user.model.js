import mongoose from 'mongoose'

const UserSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    profilePicId: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    token: String,
},
    { timestamps: true }
)

export default mongoose.model('user', UserSchema)