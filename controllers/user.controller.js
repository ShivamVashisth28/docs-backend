import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from "../utils/tokenGenerator.js"
import { doesDocTitleHaveKeyword } from "../utils/doesDocTitleHaveKeyword.js"

export const signupUser = async (req, res) => {
    const {username, name, email, password} = req.body

    try {
        const user = await User.findOne({
                $or:[{username}, {email}]
            })
        if(user){
            return res.json({
                message: "Username or Email Taken",
                status: "Error"
            })
        }
        

        const securedPassword = await bcrypt.hash(password, 10);
        
        
        await User.create({
            name,
            username,
            password: securedPassword,
            email
        })
        
        const token =  generateToken(username);

        res.cookie("authToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 86400000 // 1 day (in miliseconds)
        })

        return res.json({
            message:"User signed up success",
            status:"success"
        })
    } catch (error) {
        return res.json({
            message:"Problem in sign up",
            status:"Error",
            error
        })
    }
}

export const loginUser = async (req, res) => {
    const {username, password} = req.body
    
    try {
        const user = await User.findOne({username})
    
        if(!user){
            return res.json({
                message:"Invalid Username, no users found",
                status:'error'
            })
        }
    
        const isPassworddCorrect = await bcrypt.compare(password,user.password) 
        if(!isPassworddCorrect){
            return res.json({
                message:"Wrong Password !!",
                status:"error"
            })
        }
    
        const token = generateToken(username)
    
        res.cookie('authToken', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 86400000 // 1 day (in miliseconds)
        })
    
        return res.json({
            message:"Login Success",
            status:"success"
        })
    } catch (error) {
        return res.json({
            message:"Error in logging in",
            status:'Error',
            error
        })
    }
    
}

export const getDetails = async (req, res) => {
    const token = req.cookies.authToken

    try {
        if(!token){
            return res.json({
                message:"No token found",
                status:"Error"
            })
        }
    
        const username = verifyToken(token);
    
        if(!username){
            return res.json({
                message:"Error in decoding token",
                status:"Error"
            })
        }
    
        const user = await User.findOne({username})
    
        if(!user){
            return res.json({
                message:"No user found",
                status:"Error"
            })
        }
    
        return res.json({
            message:"Success in getting the user details",
            status:"success",
            user
        })
    } catch (error) {
        return res.json({
            message:"Error in getting user details",
            status:"Error",
            error
        })
    }


}

export const logoutUser = async (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true, 
        secure: true,   
        sameSite: 'none', 
      });

    res.json({
        message:"logout success",
        status:"success"
    })
}

export const getDocuments = async (req, res) => {
    try {
        const token = req.cookies.authToken

        if(!token){
            return res.json({
                message:"No token found",
                status:"Error",
            })
        }

        const username = await verifyToken(token)

        if(!username){
            return res.json({
                message:"Invalid Token",
                status:"Error"
            })
        }

        const user = await User.findOne({username})

        if(!user){
            return res.json({
                message:"No user found",
                status:"Error"
            })
        }

        const documents = user.documents

        if(!documents){
            return res.json({
                message:"No Documents found",
                status:"Error"
            })
        }

        return res.json({
            message:"Documents found",
            status:"success",
            documents
        })
        
    } catch (error) {
        return res.json({
            message:"Error in getting the documents",
            status: "Error",
            error
        })
    }
}

export const getFilteredDocs = async (req, res) => {
    try {
        const token = req.cookies.authToken
        const {keyword} = req.params

        if(!token){
            return res.json({
                message:"No token found",
                status:"Error"
            })
        }

        if(!keyword){
            return res.json({
                message:"No keyword found",
                status:"Error"
            })
        }

        const username = verifyToken(token)

        if(!username){
            return res.json({
                message:"No username found",
                status:"Error"
            })
        }

        const user = await User.findOne({username})

        if(!user){
            return res.json({
                message:"No user found",
                status:"Error"
            })
        }

        const documents = user.documents

        if(!documents){
            return res.json({
                message:"No docs found",
                status:"Error"
            })
        }

        // Use `Promise.all` to handle asynchronous filtering
        const filteredDocs = await Promise.all(
            documents.map(async (doc) => {
            const hasKeyword = await doesDocTitleHaveKeyword(doc.documentId, keyword);
            return hasKeyword ? doc : null;
            })
        );
  
        // Remove null entries from the result
        const docs = filteredDocs.filter((doc) => doc !== null);
    

        return res.json({
            message:"filtered docs found",
            status:"Success",
            docs
        })


    } catch (error) {
        return res.json({
            message:"Error in getting the filtered docs",
            status:"error",
            error
        })
    }  
}