const express = require('express')

const UserRoutes = require('./UserRoutes');
const QuizRoutes = require('./QuizRoutes');

const router = express.Router()

router.use('/user', UserRoutes)
router.use('/quiz', QuizRoutes)

module.exports = router