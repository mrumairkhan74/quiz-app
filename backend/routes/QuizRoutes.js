const express = require('express')
const { verifyAccessToken } = require('../middleware/VerifyToken')
const { createQuiz, startQuiz,submitQuiz,getResult } = require('../controllers/QuizController')


const router = express.Router()

router.post('/create', verifyAccessToken, createQuiz)
router.get('/start', verifyAccessToken, startQuiz)
router.get('/result', verifyAccessToken, getResult)
router.post('/submit', verifyAccessToken, submitQuiz)
module.exports = router