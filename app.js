const express = require('express')
const app = express();
const mongoose = require('mongoose')
require('dotenv').config();
const userRoute = require('./routes/UserRoutes')
const videoRoute = require('./routes/VideoRoutes')
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const commentRoute = require('./routes/CommentRoutes')



const connectWithDB = async() =>{
    try {
        const res = await mongoose.connect(process.env.MONGO_URI)
        console.log('DB connected :)')
    } catch (error) {
        console.log(error)
    }
}
connectWithDB()

app.use(bodyParser.json())
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}))

app.use('/api/user',userRoute)
app.use('/api/video',videoRoute)
app.use('/api/comment',commentRoute)

module.exports = app;