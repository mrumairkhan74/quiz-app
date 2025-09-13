const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SECRET_KEY

const verifyAccessToken = (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) return res.status(401).json({ error: "Invalid Token" })

        const decoded = jwt.verify(token, secret)

        req.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
        }
        next();
    }
    catch (error) {
        next(error);
    }
}


module.exports = { verifyAccessToken }