import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import MongoDBConnection from "../utils/config.js";
import User from '../model/user.model.js'

const rawUsers = [
    {
        username: "roy",
        email: "roy@example.com",
        password: "Roy@123",
        profilePic:
            "https://randomuser.me/api/portraits/men/11.jpg"
    },
    {
        username: "ananya",
        email: "ananya@example.com",
        password: "Ananya@123",
        profilePic:
            "https://randomuser.me/api/portraits/women/21.jpg"
    },
    {
        username: "kunal",
        email: "kunal@example.com",
        password: "Kunal@123",
        profilePic:
            "https://randomuser.me/api/portraits/men/31.jpg"
    },
    {
        username: "neha",
        email: "neha@example.com",
        password: "Neha@123",
        profilePic:
            "https://randomuser.me/api/portraits/women/41.jpg"
    },
    {
        username: "aman",
        email: "aman@example.com",
        password: "Aman@123",
        profilePic:
            "https://randomuser.me/api/portraits/men/51.jpg"
    },
    {
        username: "ishita",
        email: "ishita@example.com",
        password: "Ishita@123",
        profilePic:
            "https://randomuser.me/api/portraits/women/61.jpg"
    },
    {
        username: "rahul",
        email: "rahul@example.com",
        password: "Rahul@123",
        profilePic:
            "https://randomuser.me/api/portraits/men/71.jpg"
    },
    {
        username: "priya",
        email: "priya@example.com",
        password: "Priya@123",
        profilePic:
            "https://randomuser.me/api/portraits/women/81.jpg"
    },
    {
        username: "nikhil",
        email: "nikhil@example.com",
        password: "Nikhil@123",
        profilePic:
            "https://randomuser.me/api/portraits/men/91.jpg"
    },
    {
        username: "sana",
        email: "sana@example.com",
        password: "Sana@123",
        profilePic:
            "https://randomuser.me/api/portraits/women/92.jpg"
    }
];

async function seedUsers() {
    try {

        MongoDBConnection()

        const usersWithHash = await Promise.all(
            rawUsers.map(async ({ username, email, password, profilePic }) => {
                const hashedPassword = await bcrypt.hash(password, 10);
                return {
                    username,
                    email,
                    password: hashedPassword,
                    profilePic,
                    isVerified: true
                };
            })
        );

        await User.insertMany(usersWithHash);
        console.log("🎉 Users Inserted:\n");
        rawUsers.forEach(u =>
            console.log(`🧑‍💻 ${u.username} | ${u.email} | password: ${u.password}`)
        );

        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Failed to insert users:", err.message);
    }
}

seedUsers();
