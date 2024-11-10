const mongoose = require("mongoose");
const User = require('./UserModel');


const videoSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {type:String,required:true},
    description: {type:String,required:true},
    userId: {type:String,required:true},
    videoUrl: {type:String,required:true},
    videoId: {type:String,required:true},
    thumbnailUrl: {type:String,required:false},
    thumbnailId: {type:String, required:false},
    category: {type:String, required:true},
    tags: [{type:String}],
    likes: {type:Number, default:0},
    dislikes: {type:Number, default:0},
    views: {type:Number, default:0},
    likedBy:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    dislikedBy:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    viewedBy:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}]
},{timestamps:true})

module.exports = mongoose.model('Video',videoSchema)