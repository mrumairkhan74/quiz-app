const express = require('express')

const UserRoutes = require('./UserRoutes');
const QuizRoutes = require('./QuizRoutes');
const RoomRoutes = require('./RoomRoutes');

const router = express.Router()

router.use('/user', UserRoutes)
router.use('/quiz', QuizRoutes)
router.use('/room', RoomRoutes)

module.exports = router