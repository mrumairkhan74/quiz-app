require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/errors/ErrorHandler');
const Routes = require('./routes/AllRoutes')

const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URI,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

// Routes
app.use('/api', Routes)


app.use(errorHandler)


const port = process.env.PORT


app.listen(port, () => {
    console.log(`server running on ${port}`)
})
