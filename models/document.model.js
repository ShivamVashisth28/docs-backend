import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    documentId: {
        type: String, 
        required: true,
        unique: true 
    },
    owner: {
        type: String,
        required: true
    },
    editors: [String],
    viewers: [String],
    title: {
        type: String,
        required: true
    },
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
