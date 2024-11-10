const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    channelName: {type:String,required:true},
    email: {type:String,required:true},
    phone: {type:String,required:true},
    password: {type:String,required:true},
    logoUrl: {type:String,required:true},
    logoId: {type:String,required:true},
    subscribers: {type:Number, default:0},
    subscribedChannel:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    subscribedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
},{timestamps:true})

module.exports = mongoose.model('User',userSchema)