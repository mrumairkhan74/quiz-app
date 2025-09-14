const express = require('express')
const { createRoom, joinRoom, submitAnswers, allRoom, allRoomByUser, RoomById, startQuiz, deleteRoom } = require('../controllers/RoomController')
const { verifyAccessToken } = require('../middleware/VerifyToken')

const router = express.Router();

// for get call
router.get('/myRoom', verifyAccessToken, allRoomByUser)
router.get('/all', verifyAccessToken, allRoom)
router.get('/:id', verifyAccessToken, RoomById)

// for post call
router.post('/create', verifyAccessToken, createRoom)
router.post('/start/:id', verifyAccessToken, startQuiz)
router.post('/join/:id', verifyAccessToken, joinRoom)
router.post('/submit/:id', verifyAccessToken, submitAnswers)

// for delete call
router.delete('/:id', verifyAccessToken, deleteRoom)

module.exports = router