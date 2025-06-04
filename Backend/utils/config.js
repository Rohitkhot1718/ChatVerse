import mongoose from "mongoose";

export default async function MongoDBConnection() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ChatVerse')
        console.log('Mongodb connected...');
    } catch (error) {
        console.log('MongoDB Connection Error:', error);
    }
}