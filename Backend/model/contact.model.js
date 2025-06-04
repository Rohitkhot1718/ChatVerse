import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },   
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
  fullname: { type: String, default: "" },  
  username:{ type: String, default: "" },
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Contact", ContactSchema);
