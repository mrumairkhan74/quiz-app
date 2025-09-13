const db = require('../config/db')
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    result: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Result'
    }],
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }
}, { timestamps: true });



const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel
