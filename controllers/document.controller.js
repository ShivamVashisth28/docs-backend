import Document from "../models/document.model.js";
import generateUniqueId from 'generate-unique-id';
import { verifyToken } from "../utils/tokenGenerator.js";
import User from "../models/user.model.js";



export const createDocument = async (req, res) => {
    const { title } = req.body;

    try {
        const uniqueId = generateUniqueId();
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

        
        await Document.create({
            owner: user.username,
            documentId: uniqueId,
            title
        });

        user.documents.push({
            documentId:uniqueId,
            role:'owner'
        })

        await user.save()

        return res.status(201).json({
            message: "Created a new document",
            status: "Success",
            documentId: uniqueId
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
        
        const token = req.cookies.authToken
        if(!token){
            return res.json({
                message:"No token found",
                status:"error"
            })
        }

        const username = await verifyToken(token)

        if(!username){
            return res.json({
                message:"Invalid token",
                status:"error"
            })
        }

        const user = await User.findOne({username})

        if(!user){
            return res.json({
                message:"No user found",
                status:"error"
            })
        }
        
        
        const documents = user.documents
        
        const documentId = req.query.documentId


        if(!documentId){
            return res.json({
                message:"Doc id not found",
                status:"error"
            })
        }


        
        const document = await Document.findOneAndDelete({documentId}) 

        if(!document){
            return res.json({
                message:"No document with this id found",
                status:"error"
            })
        }
        

        const updatedDocuments = documents.filter((doc) => (
            doc['documentId'] !== documentId
        ))

        user.documents = updatedDocuments
        await user.save()

        return res.json({
            message:"Deleted the document successfully",
            status:"success",
        })

    } catch (error) {
        return res.json({
            message:"Error in deleting the document",
            status:"error",
            error
        })
    }
}
