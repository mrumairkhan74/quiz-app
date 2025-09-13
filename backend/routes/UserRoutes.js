const express = require("express")
const { verifyAccessToken } = require('../middleware/VerifyToken')
const { createUser, loginUser, getMe, logout, allUser } = require('../controllers/UserController');

const router = express.Router();


router.post('/create', createUser)
router.get('/me', verifyAccessToken, getMe)
router.post('/login', loginUser)
router.post('/logout', verifyAccessToken, logout)
router.get('/all', verifyAccessToken, allUser)



module.exports = router