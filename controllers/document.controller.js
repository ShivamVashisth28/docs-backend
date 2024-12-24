import Document from "../models/document.model.js";
import generateUniqueId from 'generate-unique-id';
import { verifyToken } from "../utils/tokenGenerator.js";
import User from "../models/user.model.js";



export const createDocument = async (req, res) => {
    const { title } = req.body;

    try {
        const uniqueId = generateUniqueId(); // Keep this for unique `documentId` generation
        const token = req.cookies.authToken;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized, Token missing or invalid",
                status: 'Error'
            });
        }

        let username;
        try {
            username = verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired token",
                status: "Error"
            });
        }

        if (!username) {
            return res.status(401).json({
                message: "Can't extract username from the token",
                status: "Error"
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                message: "No user found with this username",
                status: 'Error'
            });
        }

        // Create a new document and reference the owner's ObjectId
        const newDocument = await Document.create({
            owner: user._id, // Store user ObjectId as owner
            documentId: uniqueId,
            title
        });

        // Add the document reference to the user's `documents` array
        user.documents.push({
            documentId: newDocument._id, // Reference the Document's ObjectId
            role: 'owner'
        });

        await user.save();

        return res.status(201).json({
            message: "Created a new document",
            status: "Success",
            documentId: newDocument._id // Return the ObjectId of the document
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error in creating a new document",
            status: "Error",
            error: error.message || error
        });
    }
};

export const documentTitle = async (req, res) => {
    const documentId = req.query.documentId
    
    try {
        const document = await Document.findOne({
            documentId
        })

        if(!document){
            return res.json({
                message:"No document found",
                status:"Error"
            })
        }

        return res.json({
            message:"Document found",
            status:"success",
            title:document.title
        })

    } catch (error) {
        return res.json({
            message:"Error in getting title",
            status:"Error",
            error
        })
    }
}

export const addContent = async (req, res) => {
    try {
        const documentId = req.query.documentId
        const {content} = req.body
    
        const document = await Document.findOne({documentId})
    
        if(!document){
            return res.json({
                message:"No document found with the given doc id",
                status:"Error"
            })
        }
    
        document.content = content
        await document.save()
    
        return res.json({
            message:"Content saved successfully",
            status:"success",
            content
        })
    } catch (error) {
        return res.json({
            message:"Error in updating the content",
            status:'error',
            error
        })
    }
}

export const getContent = async (req, res) => {
    try {
        const documentId = req.query.documentId
    
        const document = await Document.findOne({documentId})
    
        if(!document){
            return res.json({
                message:"No document found with the given doc id",
                status:"Error"
            })
        }
    
        const content = document.content
    
        return res.json({
            message:"Content accessed successfully",
            status:"success",
            content
        })
    } catch (error) {
        return res.json({
            message:"Error in accessing the content",
            status:'error',
            error
        })
    }
}

export const renameDocument = async (req, res) => {
    try {
        const documentId = req.query.documentId
        const { newTitle } = req.body
        
    
        if(!documentId){
            return res.json({
                message:"Doc id not found",
                status:"error"
            })
        }

        const document = await Document.findOne({documentId})

        if(!document){
            return res.json({
                message:"No document with this id found",
                status:"error"
            })
        }
        
        if(!newTitle){
            return res.json({
                message:"No title provided",
                status:"Error"
            })
        }

       if(document.title === newTitle){
            return res.json({
                message:"Enter a Different title",
                status:"Error"
            })
       }
        document.title = newTitle
        await document.save()

        return res.json({
            message:"Renamed the document successfully",
            status:"success",
            newTitle
        })

    } catch (error) {
        return res.json({
            message:"Error renaming the document",
            status:"error",
            error
        })
    }
}

export const deleteDocument = async (req, res) => {
    try {
        const token = req.cookies.authToken; // Fixed typo
        if (!token) {
            return res.status(401).json({
                message: "No token found",
                status: "error"
            });
        }

        const username = verifyToken(token); // Assuming verifyToken returns a username
        if (!username) {
            return res.status(401).json({
                message: "Invalid token",
                status: "error"
            });
        }

        const user = await User.findOne({ username }); // Changed to findOne
        if (!user) {
            return res.status(404).json({
                message: "No user found",
                status: "error"
            });
        }

        const documentId = req.query.documentId;
        if (!documentId) {
            return res.status(400).json({
                message: "Document ID not provided",
                status: "error"
            });
        }

        const document = await Document.findOne({ _id: documentId }); // Changed to findOne and use _id
        if (!document) {
            return res.status(404).json({
                message: "No document with this ID found",
                status: "error"
            });
        }

        // Check if the user is the owner of the document
        if (user._id.toString() !== document.owner.toString()) {
            return res.status(403).json({
                message: "Not authorized to delete the document",
                status: "error"
            });
        }

        // Delete the document
        await Document.deleteOne({ _id: documentId });

        // Remove the document reference from the user's documents array
        user.documents = user.documents.filter(
            (doc) => doc.documentId.toString() !== documentId
        );
        await user.save();

        return res.status(200).json({
            message: "Deleted the document successfully",
            status: "success"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error in deleting the document",
            status: "error",
            error: error.message || error
        });
    }
};
