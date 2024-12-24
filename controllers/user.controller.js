import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from "../utils/tokenGenerator.js"

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
            secure: false,
            sameSite: 'strict',
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
                secure: false,
                sameSite: 'strict',
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
        secure: false,   
        sameSite: 'strict', 
      });

    res.json({
        message:"logout success",
        status:"success"
    })
}