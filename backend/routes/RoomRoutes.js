const express = require('express')
const { createRoom, joinRoom, submitAnswers, allRoom, allRoomByUser,RoomById, startQuiz } = require('../controllers/RoomController')
const { verifyAccessToken } = require('../middleware/VerifyToken')

const router = express.Router();


router.post('/create', verifyAccessToken, createRoom)
router.post('/start/:roomId', verifyAccessToken, startQuiz)
router.post('/join/:roomId', verifyAccessToken, joinRoom)
router.post('/submit/:roomId', verifyAccessToken, submitAnswers)
router.get('/myRoom', verifyAccessToken, allRoomByUser)
router.get('/all', verifyAccessToken, allRoom)
router.get('/:id', verifyAccessToken, RoomById)


module.exports = router