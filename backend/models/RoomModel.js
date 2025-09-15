const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        unique: true,
        required: true
    },
    players: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        score: {
            type: Number, default: 0
        },
        attemptNumber: {
            type: Number,
            default: 0
        },
        answers: [{
            quizId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz'
            },
            answer: String
        }],
        completed: {
            type: Boolean,
            default: false
        }
    }],
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    questions: [{
        questionId: { type: mongoose.Schema.Types.ObjectId },   // Question ID
        question: String,
        options: [String],
        correctOption: String // optional: you can hide this from players
    }],

    status: {
        type: String,
        enum: ['waiting', 'inprogress', 'completed'],
        default: 'waiting'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })


const RoomModel = mongoose.model('Room', roomSchema)

module.exports = RoomModel