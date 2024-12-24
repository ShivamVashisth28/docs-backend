import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    documentId: {
        type: String, 
        required: true,
        unique: true 
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    editors: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User"
        }
    ],
    viewers: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User"
        }
    ],
    content: {
        type: String,
        default:""
    },
    createdAt: {
        type: Date,
        default: Date.now 
    },
    updatedAt: {
        type: Date,
        default: Date.now 
    }
});

const Document = mongoose.model("Document", documentSchema);
export default Document;
