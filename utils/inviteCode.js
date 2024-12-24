import jwt from 'jsonwebtoken'

export const genereateInviteCode = async (email, accessType ) => {
    const payload = {
        email,
        accessType,
    }
    const code = jwt.sign(payload,process.env.JWT_SECRET);
    return code;
}

export const verifyInviteCode = (code) => {
    try {
        const decoded = jwt.verify(code, process.env.JWT_SECRET);
        return decoded; 
    } catch (err) {
        throw new Error('Invalid or expired token'); 
    }
}