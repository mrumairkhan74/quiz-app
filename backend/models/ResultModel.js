const mongoose = require('mongoose')
const resultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    answers: [{
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
        },
        selectedAnswer: {
            type: String,
            required: true
        },
        isCorrect: { type: Boolean, required: true }
    }],
    score: {
        type: String,
        required: true
    },
    attemptNumber: {
        type: Number,
        required: true,
    },

}, { timestamps: true })


const ResultModel = mongoose.model('Result', resultSchema)

module.exports = ResultModel