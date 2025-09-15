const UserModel = require('../models/UserModel')
const { GenerateToken } = require('../utils/GenerateToken')
const { NotFoundError, BadRequestError, ConflictError } = require('../middleware/errors/HttpError')
const hashedPassword = require('../utils/HashedPassword')
const bcrypt = require('bcrypt')

// Cookie options for cross-origin (Vercel frontend, Render backend)
const cookieOptions = {
    httpOnly: true,       // prevent JS access
    secure: true,         // HTTPS only
    sameSite: 'None',     // allow cross-site
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}

// Create User
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
        });

        const token = GenerateToken(user._id, user.name, user.email);

        res.cookie('token', token, cookieOptions);

        return res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
}

// Login User
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) throw new NotFoundError("User Email Incorrect");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new BadRequestError("Incorrect Password");

        const token = GenerateToken(user._id, user.name, user.email);

        res.cookie('token', token, cookieOptions);

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
}

// Logout User
const logout = async (req, res, next) => {
    try {
        res.clearCookie('token', cookieOptions);
        return res.status(200).json({
            success: true,
            message: "Logout Successfully"
        });
    } catch (error) {
        next(error);
    }
}

// All users (for frontend display with results)
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
}

// Get current user
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
