import jwt from 'jsonwebtoken'

export const generateToken =  (username) => {
    const token =  jwt.sign({username},process.env.JWT_SECRET);
    return token;
}

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded )
        return decoded.username; 
    } catch (err) {
        throw new Error('Invalid or expired token'); 
    }
};