const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');  
dotenv.config();

const generateAccessToken = (userType='', username ='') => {
    if (userType != null){
        if (userType.toLowerCase() == 'root' || userType.toLowerCase() == 'admin' || userType.toLowerCase() == 'guest'){
            return jwt.sign(
                {
                    user_type: userType.toLowerCase(),
                    username: username,
                },
                process.env.TOKEN_SECRET, 
                { expiresIn: "30m" }
            );
        }
        else{
            return null;
        }
    }   
    else{
        return null;
    }
}

const generatePasswordResetToken = (email) => {
    if (email){
        return jwt.sign(
            {
                email: email,
                purpose: 'passwordReset'
            },
            process.env.TOKEN_SECRET, 
            { expiresIn: "5m" }
        );
    }   
    else{
        return null;
    }
}



module.exports = {
    generateAccessToken,
    generatePasswordResetToken
}