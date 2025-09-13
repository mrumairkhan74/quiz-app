const UserModel = require('../models/UserModel')
const { GenerateToken } = require('../utils/GenerateToken')
const { NotFoundError, BadRequestError, ConflictError } = require('../middleware/errors/HttpError')
const hashedPassword = require('../utils/HashedPassword')
const bcrypt = require('bcrypt')


// create User
const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const checkEmail = await UserModel.findOne({ email });
        if (checkEmail) throw new ConflictError('User Conflict');

        const hashed = await hashedPassword(password);
        const user = await UserModel.create({
            name,
            email,
            password: hashed
        })

        const token = GenerateToken(user._id, user.name, user.email);

        res.cookie('token', token);

        return res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        next(error)
    }
}


// login User
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email })
        if (!user) throw new NotFoundError("User Email Incorrect");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new BadRequestError("Incorrect Password")

        const token = GenerateToken(user._id, user.name, user.email)
        res.cookie('token', token)

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }
    catch (error) {
        next(error)
    }
}


// logout User
const logout = async (req, res, next) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({
            success: true,
            message: "Logout Successfully"
        })
    }
    catch (error) {
        next(error)
    }
}


// all user which used to display on front with result 
const allUser = async (req, res, next) => {
    try {
        const users = await UserModel.find()
            .select("name")
            .populate("result", "score attemptNumber");

        if (!users || users.length === 0) {
            throw new NotFoundError("Users not found");
        }

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        next(error);
    }
};


// get current user
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        return res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    allUser,
    createUser,
    loginUser,
    logout,
    getMe
}