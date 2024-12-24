import User from "../models/user.model.js";

export const deleteDocumentFromUserList = async (username, documentId) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.warn(`User not found: ${username}`);
            return;
        }

        // Filter out the document
        user.documents = user.documents.filter((doc) => doc.documentId !== documentId);

        await user.save();
    } catch (error) {
        console.error(`Error in deleting document from user (${username}) doc list:`, error);
        throw new Error("Error in deleting document from the user doc list");
    }
};