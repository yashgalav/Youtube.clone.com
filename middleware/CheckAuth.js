const jwt = require('jsonwebtoken')
require("dotenv").config;


module.exports = async (req, res, next) =>{
    try {
        const token = req.headers.authorization.split(" ")[1]
        const user = await jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user = user
        next()
    } catch (error) {
        return res.status(500).json({
            error:"Invalid token"
        })
    }
}