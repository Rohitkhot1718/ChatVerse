import User from '../model/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid';
import sendVerificationEmail from '../utils/sendMail.js';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() });
const uploadMiddleware = upload.single('profilePic');

async function handleSignUp(req, res) {
    const { username, email, password } = req.body
    const verificationToken = uuidv4()
    try {
        const findUser = await User.findOne({ email })
        if (findUser) {
            return res.status(400).json({ message: 'Email already exists' })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            username,
            email,
            password: hashPassword,
            isVerified: false,
            token: verificationToken
        })
        await user.save()

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const subject = "Verify your email - ChatVerse";
        const html = `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1>Email Verification</h1>
                    <p>Thank you for registering with ChatVerse. Please click the button below to verify your email address:</p>
                    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    <p>If the button doesn't work, you can also click this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
                </div>
            `
        sendVerificationEmail(email, subject, html)
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: "Failed to create user", error: error.message });
        console.log(error)
    }
}

async function handleSignIn(req, res) {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: "Invalid Credentials" })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" })

        if (user.isVerified && user.token) {
            await User.findByIdAndUpdate(user._id, {
                $unset: { token: "" }
            });
        }

        if (!user.isVerified) {
            // Check if user already has a verification token
            if (user.token) {
                // User already has verification email, just remind them
                return res.status(403).json({
                    message: "Please verify your email before signing in",
                    isVerified: false,
                    hasPendingVerification: true
                });
            } else {
                const verificationToken = uuidv4();
                user.token = verificationToken;
                await user.save();

                const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
                const subject = "Verify your email - ChatVerse";
                const html = `
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1>Email Verification</h1>
                        <p>Thank you for registering with ChatVerse. Please click the button below to verify your email address:</p>
                        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                        <p>If the button doesn't work, you can also click this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
                    </div>
                `;

                sendVerificationEmail(email, subject, html);

                return res.status(403).json({
                    message: "New verification email has been sent",
                    isVerified: false,
                    hasPendingVerification: false,
                    newEmailSent: true
                });
            }
        }

        const { password: _, ...userWithoutPassword } = user.toObject();

        const token = jwt.sign({ id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ message: "User Signed In successfully", user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: "Failed to signin user", error: error.message });
    }
}

function handleSignOut(_, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    })
    res.status(200).json({ message: "User signed out successfully" });
}

async function handleUpdateProfile(req, res) {
    const userId = req.user.id
    const { username, bio, removeProfilePic } = req.body
    try {
        const user = await User.findById(userId);
        const updates = {};

        if (removeProfilePic === "true" && user.profilePicId) {
            await cloudinary.uploader.destroy(user.profilePicId);
            updates.profilePic = "";
            updates.profilePicId = "";
        }

        if (req.file) {
            if (user.profilePicId) {
                await cloudinary.uploader.destroy(user.profilePicId);
            }
            const bufferStream = Readable.from(req.file.buffer);
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: 'profile_pics' }, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });

                bufferStream.pipe(stream);
            });
            updates.profilePic = result.secure_url
            updates.profilePicId = result.public_id;
        }

        if (username) updates.username = username
        if (bio) updates.bio = bio

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password')
        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile picture", error: error.message });
        console.log(error)
    }
}

async function handleEmailVerification(req, res) {
    const { token } = req.query
    try {
        const updatedUser = await User.findOneAndUpdate(
            { token: token },
            { isVerified: true },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: "Invalid or expired token", token: token });
        }

        res.status(200).json({ message: "Email verified successfully", token: token });
    } catch (error) {
        res.status(400).json({ message: "Failed to verify email", token: token });
    }

}

async function handleForgotPassword(req, res) {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: "Invalid Email" })


        const verificationToken = uuidv4()
        user.token = verificationToken
        await user.save();

        const verificationUrl = `https://chat-verse-g8iw.onrender.com/reset-password?token=${verificationToken}`;
        const subject = "Reset Your Password - ChatVerse";
        const html = `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; background: #f4f4f4; border-radius: 10px;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>We received a request to reset your ChatVerse account password. Click the button below to proceed:</p>
                    <a href="${verificationUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 25px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a>
                    <p>If the button doesn’t work, copy and paste this link into your browser:</p>
                    <a href="${verificationUrl}" style="color: #007BFF;">${verificationUrl}</a>
                    <p style="margin-top: 30px;">If you didn’t request a password reset, you can ignore this email.</p>
                    <p style="color: #888;">— ChatVerse Team</p>
                </div>
            `
        sendVerificationEmail(email, subject, html)

        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (err) {
        console.error("Forgot password error:", err.message);
        res.status(500).json({ message: "Something went wrong." });
    }
}

async function handleResetPassword(req, res) {
    const { password } = req.body
    const { token } = req.query

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        res.status(200).json({ message: "Password updated successfully." });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
}


export { handleSignUp, handleSignIn, handleSignOut, handleUpdateProfile, handleEmailVerification, handleForgotPassword, handleResetPassword, uploadMiddleware }
