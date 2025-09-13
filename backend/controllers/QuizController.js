const QuizModel = require("../models/QuizModel");
const ResultModel = require('../models/ResultModel')
const UserModel = require('../models/UserModel')
const { ForbiddenError, NotFoundError } = require('../middleware/errors/HttpError')

const createQuiz = async (req, res, next) => {
    try {
        const { question, options, correctOption } = req.body;
        const questionExists = await QuizModel.findOne({ question })
        if (questionExists) throw new ConflictError("Question Conflict")


        const formattedOptions = Array.isArray(options)
            ? options : options.split(',').map(opt => opt.trim());


        const questions = await QuizModel.create({
            question,
            options: formattedOptions,
            correctOption
        })
        return res.status(201).json({
            success: true,
            questions
        })
    }
    catch (error) {
        next(error)
    }
}

const startQuiz = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const QUESTION_PER_ATTEMPT = 5

        const user = await UserModel.findById(userId).populate('result')
        const attempt = user.result.length;

        if (attempt >= 5) {
            return res.status(403).json({ message: "You Reach Maximum Attempts" })
        }
        const quiz = await QuizModel.aggregate([
            { $sample: { size: QUESTION_PER_ATTEMPT } },
            { $project: { correctOption: 0 } }
        ]);

        return res.status(200).json({
            attemptNumber: attempt + 1,
            quiz
        })
    }
    catch (error) {
        next(error)
    }
}


const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;
        const userId = req.user?.id; // assuming authentication middleware sets req.user

        let score = 0;
        const checkedAnswers = [];

        for (let ans of answers) {
            const quiz = await QuizModel.findById(ans.quizId);
            if (!quiz) continue;

            const isCorrect = quiz.correctOption === ans.selectedAnswer;
            if (isCorrect) score++;

            checkedAnswers.push({
                quizId: ans.quizId,
                selectedAnswer: ans.selectedAnswer,
                isCorrect,
            });
        }

        const attemptCount = await ResultModel.countDocuments({ userId })
        if (attemptCount >= 5) throw new ForbiddenError("You reached You limit of attempt quiz")
        const result = await ResultModel.create({
            user: userId,
            attemptNumber: attemptCount + 1,
            answers: checkedAnswers,
            score,
        });

        await UserModel.findByIdAndUpdate(userId, {
            $push: { result: result._id }
        })
        return res.status(201).json({
            success: true,
            message: "Quiz submitted successfully",
            score,
            attemptNumber: attemptCount + 1,
            result,
        });
    } catch (error) {
        next(error);
    }
};


const getResult = async (req, res, next) => {
    try {
        const userId = req.user?.id
        const results = await ResultModel.find({ user: userId }).populate('user', 'name').select("-answers").sort({ createdAt: -1 })
        if (!results || results.length === 0) throw new NotFoundError("You Result unavailable")
        return res.status(200).json({ success: true, results })
    }
    catch (error) {
        next(error)
    }
}

module.exports = {
    createQuiz,
    startQuiz,
    submitQuiz,
    getResult
}