
const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        unique: true
    },
    options: [{
        type: String,
    }],
    correctOption: {
        type: String,
    }
}, { timestamps: true })


const QuizModel = mongoose.model('Quiz', quizSchema)

module.exports = QuizModel