const jwt = require('jsonwebtoken')


const secret = process.env.JWT_SECRET_KEY
const expiry = process.env.JWT_EXPIRY

const GenerateToken = (id, name, email) => {
    return jwt.sign({ id, email, name }, secret, { expiresIn: expiry });
}


module.exports = { GenerateToken }