import mongoose from "mongoose";

export default async function MongoDBConnection() {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log('Mongodb connected...');
    } catch (error) {
        console.log('MongoDB Connection Error:', error);
    }
}