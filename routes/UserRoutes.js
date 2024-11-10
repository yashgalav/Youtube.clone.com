const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const UserModel = require('/models/UserModel');
const { default: mongoose } = require("mongoose");
const cloudinary = require('cloudinary').v2;
require("dotenv").config;
const jwt = require('jsonwebtoken');
const checkAuth = require('/middleware/checkAuth');


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

router.post('/signup', async (req, res) =>{
    try {
        const existingUsers = await UserModel.find({email:req.body.email})
        
        if(existingUsers.length  > 0){
            return res.status(500).json({
                error : 'email already registered :('
            })
        }
        const hashPassword = await bcrypt.hash(req.body.password,10)
        const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath)
        
        const newUser = new UserModel({
            _id: new mongoose.Types.ObjectId,
            channelName: req.body.channelName,
            email: req.body.email,
            phone: req.body.phone,
            password: hashPassword,
            logoUrl: uploadedImage.secure_url,
            logoId:uploadedImage.public_id
        })

        const savedUser = await newUser.save();
        res.status(200).json({
            user:savedUser
        })

    } catch (error) {
        res.status(500).json({
            "error":error
        })
    }
})

router.post("/login", async (req, res) =>{
    try {
        const exsitingUser = await UserModel.find({email:req.body.email})
        if(exsitingUser.length == 0){
            return res.status(500).json({
                error : "user not found! please signup :)"
            })
        }
        const isValidPassword = await bcrypt.compare(req.body.password, exsitingUser[0].password);
        if(!isValidPassword){
            return res.status(500).json({
                error : "Invalid Password!!"
            })
        }

        const token = jwt.sign({
            _id:exsitingUser[0].id,
            channelName:exsitingUser[0].channelName,
            email:exsitingUser[0].email,
            phone:exsitingUser[0].phone,
            logoId:exsitingUser[0].logoId
            },
            process.env.JWT_SECRET_KEY,
            {
            expiresIn:'365d'
            }
        )

        res.status(200).json({
            _id:exsitingUser[0]._id,
            channelName:exsitingUser[0].channelName,
            email:exsitingUser[0].email,
            phone:exsitingUser[0].phone,
            logoId:exsitingUser[0].logoId,
            logoUrl:exsitingUser[0].logoUrl,
            token:token,
            subcribers:exsitingUser[0].subscribers,
            subscribedChannel:exsitingUser[0].subscribedChannel
        })

    } catch (error) {
        res.status(500).json({
            "error":error
        })
    }
})

router.put("/subscribed/:channelId", checkAuth, async(req, res) =>{
    try {
        reqUser = await UserModel.findById(req.user._id)
        channel = await UserModel.findById(req.params.channelId)

        
        if(reqUser._id == req.params.channelId){
            return res.status(500).json({
                message : "You cannot subscribe your channel !!"
            }) 
        }   
        let message;
        if(!reqUser.subscribedChannel.includes(channel._id)){
            reqUser.subscribedChannel.push(channel._id)
        }else{
            reqUser.subscribedChannel.pop(channel._id)
        }
        
        if(!channel.subscribedBy.includes(reqUser._id)){
            channel.subscribedBy.push(reqUser._id)
            message = "Subscrbed :)"
        }else{
            channel.subscribedBy.pop(reqUser._id)
            message = "Unsubscrbed :)"
        }
        const updatedReqUser = await reqUser.save();
        await channel.save();

        return res.status(200).json({
            user : updatedReqUser 
        })

    } catch (error) {
        res.status(500).json({
            "error":error
        }) 
    }

})

module.exports = router