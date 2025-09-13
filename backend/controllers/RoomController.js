const QuizModel = require('../models/QuizModel')
const RoomModel = require('../models/RoomModel')
const { NotFoundError } = require('../middleware/errors/HttpError')
const UserModel = require('../models/UserModel')


const createRoom = async (req, res) => {
    try {
        const { roomName, createdBy } = req.body

        // pick 10 random quiz docs (questions)
        const selectedQuestions = await QuizModel.aggregate([{ $sample: { size: 10 } }])

        if (!selectedQuestions || selectedQuestions.length === 0) {
            return res.status(404).json({ message: "No questions found" })
        }

        // save them in room (store snapshot of question text, options, and correctAnswer)
        const newRoom = new RoomModel({
            roomName,
            createdBy,
            questions: selectedQuestions.map(q => ({
                questionId: q._id,
                questionText: q.question,   // correct field
                options: q.options,
                correctOption: q.correctOption  // correct field
            }))

        })

        await newRoom.save()

        // optional: add room to user
        await UserModel.findByIdAndUpdate(createdBy, {
            $push: { rooms: newRoom._id },
        })

        res.status(201).json(newRoom)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Error creating room" })
    }
}



const joinRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params
        const userId = req.user?.id;

        const room = await RoomModel.findById(roomId);
        if (!room) throw new NotFoundError("Invalid! Room Not Found")

        if (room.players.some((p) => p.user.toString() === userId)) {
            return res.status(400).json("User Already Joined")
        }

        room.players.push({ user: userId })
        await room.save()

        // also push room id in usersModel
        await UserModel.findByIdAndUpdate(userId, {
            $push: { rooms: room._id }
        })

        return res.status(200).json(room)

    }
    catch (error) {
        next(error)
    }
}

const submitAnswers = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { answers } = req.body;
        const userId = req.user?.id
        const room = await RoomModel.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        let score = 0;
        let checkedAnswers = [];

        for (let ans of answers) {
            const question = await QuizModel.findById(ans.quizId);
            if (!question) continue;

            const isCorrect = question.correctOption?.trim().toLowerCase() === ans.answer.trim().toLowerCase();

            if (isCorrect) score++;

            checkedAnswers.push({
                quizId: ans.quizId,
                submitted: ans.answer,
                correct: question.correctOption,
                isCorrect
            });
        }

        // update player score in room
        const playerIndex = room.players.findIndex(p => p.user?.toString() === userId.toString());
        if (playerIndex !== -1) {
            room.players[playerIndex].score = score;
            room.players[playerIndex].completed = true;
        } else {
            room.players.push({ user: userId, score, answers,completed: true });
        }

        await room.save();

        res.status(200).json({
            success: true,
            score,
            checkedAnswers
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createRoom,
    joinRoom,
    submitAnswers
}
