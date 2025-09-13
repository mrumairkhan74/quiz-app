require('dotenv').config();

const mongoose = require('mongoose');


const db = mongoose.connect(process.env.MONGO_URI)


db.then(() => {
    console.log("✅ Connected To Database");
})
db.catch(() => {
    console.log("❌Not Connected To Database");
});


module.exports = db