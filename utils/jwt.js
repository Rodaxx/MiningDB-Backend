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

module.exports = {
    generateAccessToken
}