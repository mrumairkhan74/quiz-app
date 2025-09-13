const express = require('express')
const { createRoom, joinRoom, submitAnswers } = require('../controllers/RoomController')
const { verifyAccessToken } = require('../middleware/VerifyToken')

const router = express.Router();


router.post('/create', verifyAccessToken, createRoom)
router.post('/join/:roomId', verifyAccessToken, joinRoom)
router.post('/submit/:roomId', verifyAccessToken, submitAnswers)

module.exports = router