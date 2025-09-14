const QuizModel = require('../models/QuizModel')
const RoomModel = require('../models/RoomModel')
const { NotFoundError, UnAuthorized } = require('../middleware/errors/HttpError')
const UserModel = require('../models/UserModel');
const mongoose = require('mongoose')


const createRoom = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { roomName } = req.body

        // pick 10 random quiz docs (questions)
        const selectedQuestions = await QuizModel.aggregate([{ $sample: { size: 10 } }])

        if (!selectedQuestions || selectedQuestions.length === 0) {
            return res.status(404).json({ message: "No questions found" })
        }

        // save them in room (store snapshot of question text, options, and correctOption)
        const newRoom = new RoomModel({
            roomName,
            createdBy: userId,
            players: [{
                user: userId,
                score: 0,
                attemptNumber: 0,
                completed: false
            }],
            questions: selectedQuestions.map(q => ({
                questionId: q._id,
                question: q.question,
                options: q.options,
                correctOption: q.correctOption,
            }))

        })

        await newRoom.save()

        // optional: add room to user
        await UserModel.findByIdAndUpdate(userId, {
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
        const { id } = req.params
        const userId = req.user?.id;

        const room = await RoomModel.findById(id);
        if (!room) throw new NotFoundError("Invalid! Room Not Found")

        if (room.players.some((p) => p.user?.toString() === userId)) {
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
        const userId = req.user?.id;
        const { id } = req.params; // roomId
        const { answers } = req.body; // [{ quizId, answer }]

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: "Answers must be a non-empty array" });
        }

        const room = await RoomModel.findById(id);
        if (!room) return res.status(404).json({ message: "Room not found" });

        const playerIndex = room.players.findIndex(
            (p) => p.user?.toString() === userId.toString()
        );
        if (playerIndex === -1) {
            return res.status(403).json({ message: "You must join the room first" });
        }

        const player = room.players[playerIndex];
        let score = 0;

        const CalculateScore = answers.map((a) => {
            // Find the question by questionId
            const question = room.questions.find(
                (q) => q.questionId.toString() === a.quizId.toString()
            );

            if (question && question.correctOption?.trim().toLowerCase() === a.answer?.trim().toLowerCase()) {
                score++;
            }

            return {
                quizId: a.quizId,
                answer: a.answer,
            };
        });

        // Update player stats
        player.score = score;
        player.completed = true;
        player.attemptNumber = (player.attemptNumber || 0) + 1;
        player.answers = CalculateScore;

        await room.save();

        return res.status(200).json({
            success: true,
            message: "Quiz submitted successfully",
            score,
            room,
        });
    } catch (error) {
        next(error);
    }
};







// all Room 
const allRoom = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        const rooms = await RoomModel.find()
            .populate('createdBy', 'name email')
            .select('roomName players createdBy createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        if (!rooms || rooms.length === 0) throw new NotFoundError("No Room Available");

        const roomsWithPlayerCount = rooms.map(r => ({
            ...r.toObject(),
            playerCount: r.players ? r.players.length : 0
        }));

        const totalRooms = await RoomModel.countDocuments();

        return res.status(200).json({
            success: true,
            page: pageNum,
            totalPages: Math.ceil(totalRooms / limitNum),
            totalRooms,
            rooms: roomsWithPlayerCount
        });

    } catch (error) {
        next(error);
    }
};

const allRoomByUser = async (req, res, next) => {
    try {
        const userId = req.user?.id

        const rooms = await RoomModel.find({ createdBy: userId }).sort({ createdAt: -1 })
        if (!rooms) throw new NotFoundError("No Room Available")

        return res.status(200).json({
            success: true,
            rooms
        })

    }
    catch (error) {
        next(error)
    }
}


const RoomById = async (req, res, next) => {
    try {
        const userId = req.user?.id

        const { id } = req.params;



        const room = await RoomModel.findById(id)
            .populate('createdBy', 'name')
            .populate('players.user', 'name')

        // check if user is in room.players
        const isJoined = room.players.some(p => p.user?._id.toString() === userId.toString());
        if (!isJoined) {
            return res.status(403).json({ message: "You must join the room to view this quiz." });
        }


        return res.status(200).json({
            success: true,
            room
        })
    }
    catch (error) {
        next(error)
    }
}

const startQuiz = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const room = await RoomModel.findById(id);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Only creator can start the quiz
        if (room.createdBy?.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Only the creator can start the quiz" });
        }

        if (room.status === "inprogress") {
            return res.status(400).json({ success: false, message: "Quiz already started" });
        }

        // ✅ Make sure creator is also in players
        const alreadyInPlayers = room.players.some(
            (p) => p.user?.toString() === userId.toString()
        );
        if (!alreadyInPlayers) {
            room.players.push({
                user: userId,
                score: 0,
                attemptNumber: 0,
                completed: false,
                answers: []
            });
        }

        // ✅ Set status to inprogress
        room.status = "inprogress";
        await room.save();

        return res.status(200).json({
            success: true,
            message: "Quiz started successfully",
            room,
        });
    } catch (error) {
        next(error);
    }
};



const deleteRoom = async (req, res, next) => {
    try {
        const userId = req.user?.id
        const { id } = req.params;
        const room = await RoomModel.findById(id)

        if (room.createdBy.toString() !== userId.toString()) throw new UnAuthorized("You cannot delete this room")

        await RoomModel.findByIdAndDelete(id)

        await UserModel.updateMany(
            { rooms: room._id },
            { $pull: { rooms: room._id } }
        )

        return res.status(200).json({
            success: true,
            message: "Room Deleted SuccessFully"
        })
    }
    catch (error) {
        next(error)
    }
}


// POST /room/finish/:id
const UpdateStatus = async (req, res) => {

    const userId = req.user.id
    const room = await RoomModel.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Only creator can finish
    if (room.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Only creator can finish the room' });
    }

    // Mark as finished
    room.status = 'finished';
    await room.save();

    res.json({ message: 'Room marked as finished', room });
};


module.exports = {
    createRoom,
    joinRoom,
    submitAnswers,
    allRoom,
    allRoomByUser,
    RoomById,
    startQuiz,
    deleteRoom,
    UpdateStatus
}
