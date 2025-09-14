const QuizModel = require('../models/QuizModel')
const RoomModel = require('../models/RoomModel')
const { NotFoundError, UnAuthorized } = require('../middleware/errors/HttpError')
const UserModel = require('../models/UserModel');



const createRoom = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { roomName } = req.body

        // pick 10 random quiz docs (questions)
        const selectedQuestions = await QuizModel.aggregate([{ $sample: { size: 10 } }])

        if (!selectedQuestions || selectedQuestions.length === 0) {
            return res.status(404).json({ message: "No questions found" })
        }

        // save them in room (store snapshot of question text, options, and correctAnswer)
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
                questionText: q.questions,
                correctAnswer: q.correctAnswer,
                options: q.options,
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
        const userId = req.user.id;
        const { id } = req.params; // roomId
        const { answers } = req.body; // [{ quizId, answer }]

        const room = await RoomModel.findById(id);
        if (!room) return res.status(404).json({ message: "Room not found" });

        let score = 0;

        // Check answers
        for (let ans of answers) {
            const question = room.questions.find(
                (q) => q.questionId.toString() === ans.quizId.toString()
            );
            if (question && question.correctAnswer === ans.answer) {
                score++;
            }
        }

        const playerIndex = room.players.findIndex(
            (p) => p.user?.toString() === userId.toString()
        );

        if (playerIndex === -1) {
            return res
                .status(403)
                .json({ message: "You must join the room first" });
        }

        // Update player stats
        const player = room.players[playerIndex];
        player.score = score;
        player.completed = true;
        player.attemptNumber = (player.attemptNumber || 0) + 1;

        // Save submitted answers (overwrite old ones for this attempt)
        player.answers = answers.map((a) => ({
            quizId: a.quizId,
            answer: a.answer,
        }));

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
        const { roomId } = req.params;

        const room = await RoomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Only creator can start the quiz
        if (room.createdBy.toString() !== userId.toString()) {
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


module.exports = {
    createRoom,
    joinRoom,
    submitAnswers,
    allRoom,
    allRoomByUser,
    RoomById,
    startQuiz,
    deleteRoom
}
