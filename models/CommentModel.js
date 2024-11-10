const mongoose = require('mongoose')
const User = require("./UserModel");
const VideoModel = require('./VideoModel');

const commentSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    commentText: {type:String,required:true},
    userId: {type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    videoId: {type:mongoose.Schema.Types.ObjectId,ref:'VideoModel',required:true}
},{timestamps:true})

module.exports = mongoose.model('comment',commentSchema)