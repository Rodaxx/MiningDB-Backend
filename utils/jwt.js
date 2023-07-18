const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');  
dotenv.config();

const generateAccessToken = (userType, email, remember) => {
    if (userType != null){
        if (userType.toLowerCase() == 'root' || userType.toLowerCase() == 'admin' || userType.toLowerCase() == 'guest'){
            let expTime = process.env.TOKEN_DEFAULT_DURATION;
            if (remember = true){
                expTime = process.env.TOKEN_REMEMBER_DURATION;
            }
            return "Bearer " + jwt.sign(
                {
                    user_type: userType.toLowerCase(),
                    email: email,
                },
                process.env.TOKEN_SECRET, 
                {
                    expiresIn: expTime
                }
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

module.exports = {
    generateAccessToken
}