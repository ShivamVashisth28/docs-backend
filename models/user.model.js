import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    password: {
        type: String,
        required: true
    },
    documents: [
        {
            documentId: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Document", 
                required: true
            },
            role: {
                type: String,
                enum: ["owner", "editor", "viewer"], 
                required: true
            }
        }
    ]
});

const User = mongoose.model("User", userSchema);
export default User;
