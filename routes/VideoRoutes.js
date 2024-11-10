const express = require("express");
const checkAuth = require('/middleware/checkAuth');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const VideoModel = require('/models/VideoModel')
const mongoose = require("mongoose");
require("dotenv").config;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

router.post('/upload', checkAuth,async(req, res)=>{
    try {
        const user = req.user;
        const body = req.body;

        let uploadedThumbnail ;
        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath,{
            resource_type:'video'
        })
        if(req.files.thumbnail)
            uploadedThumbnail= await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
       
        const videoTobeSaved  = new VideoModel({
            _id: new mongoose.Types.ObjectId,
            title: body.title,
            description: body.description,
            userId: user._id,
            videoUrl: uploadedVideo.secure_url,
            videoId: uploadedVideo.public_id,
            thumbnailUrl: uploadedThumbnail ? uploadedThumbnail.secure_url : null,
            thumbnailId: uploadedThumbnail ? uploadedThumbnail.public_id : null,
            category: body.category,
            tags: body.tags.split(",")
        }) 
    
        const airedVideo = await videoTobeSaved.save();

        res.status(200).json(airedVideo)
            
    } catch (error) {
        res.status(500).json({
            error
        })
    }

})

router.put('/:videoId', checkAuth, async(req, res)=>{
    try {

        const existingVideo = await VideoModel.findById(req.params.videoId);
        const verifiedUser = req.user;
        const reqBody = req.body;
        const reqFiles = req.files;
        let airedVideo;


        if(existingVideo.userId == verifiedUser._id){

            if(req.files){
                await cloudinary.uploader.destroy(existingVideo.thumbnailId)
                const updatedThumbnail = await cloudinary.uploader.upload(reqFiles.thumbnail.tempFilePath);
                if(reqBody.title == "" || null == reqBody.title)
                    title = reqBody.title
                const updatedData ={
                    title: reqBody.title || existingVideo.title,
                    description: reqBody.description || existingVideo.description,
                    thumbnailUrl: updatedThumbnail.secure_url,
                    thumbnailId: updatedThumbnail.public_id,
                    category: reqBody.category || existingVideo.category,
                    tags: reqBody.tags ? reqBody.tags.split(",") : existingVideo.tags
                }
                airedVideo = await VideoModel.findByIdAndUpdate(req.params.videoId,updatedData)
            }else{
                const updatedData ={
                    title: reqBody.title || existingVideo.title,
                    description: reqBody.description || existingVideo.description,
                    category: reqBody.category || existingVideo.category,
                    tags: reqBody.tags ? reqBody.tags.split(",") : existingVideo.tags
                }
                airedVideo = await VideoModel.findByIdAndUpdate(req.params.videoId,updatedData)
            }

            res.status(200).json(airedVideo)


        }else{
            
            return res.status(500).json({
                error:"You have not permission :("
            })
        }
            
    } catch (error) {
        res.status(500).json({
            error:error
        })
    }

})



router.delete('/:videoId', checkAuth, async(req, res)=>{
    try {

        const existingVideo = await VideoModel.findById(req.params.videoId);
        const verifiedUser = req.user;
        
        if(existingVideo.userId == verifiedUser._id){
            await cloudinary.uploader.destroy(existingVideo.videoId);
            await cloudinary.uploader.destroy(existingVideo.thumbnailId);
            await VideoModel.findByIdAndDelete(req.params.videoId);
            
            res.status(200).json({
                message:"Video deleted Sucessfully :)"
            })

        }else{
            return res.status(500).json({
                error:"You have not permission :("
            })
        }
            
    } catch (error) {
        res.status(500).json({
            err:error
        })
    }
})

// API Like
router.put('/like/:videoId', checkAuth, async(req, res)=>{
    try {

        const existingVideo = await VideoModel.findById(req.params.videoId);
        const verifiedUser = req.user;
        let message ;
        if(existingVideo.likedBy.includes(verifiedUser._id)){
            existingVideo.likes -= 1;
            existingVideo.likedBy.pop(verifiedUser._id);
            message = "Like removed :("
        }else{
            existingVideo.likes +=1
            existingVideo.likedBy.push(verifiedUser._id)
            message = "Liked !!"
        }

        if(existingVideo.dislikedBy.includes(verifiedUser._id)){
            existingVideo.dislikedBy.pop(verifiedUser._id)
            existingVideo.dislikes -= 1;
        }

        const updatedData = await existingVideo.save();

        return res.status(200).json({
            videoId : updatedData._id,
            dislikes:  updatedData.dislikes,
            likes : updatedData.likes
        })
             
    } catch (error) {
        res.status(500).json({
            error
        })
    }
})

// Add DisLike
router.put('/dislike/:videoId', checkAuth, async(req, res)=>{
    try {

        const existingVideo = await VideoModel.findById(req.params.videoId);
        const verifiedUser = req.user;
        let message ;
        if(existingVideo.dislikedBy.includes(verifiedUser._id)){
            existingVideo.dislikes -= 1;
            existingVideo.dislikedBy.pop(verifiedUser._id);
            message = "Dislike removed :("
        }else{
            existingVideo.dislikes +=1
            existingVideo.dislikedBy.push(verifiedUser._id)
            message = "disliked :("
        }

        if(existingVideo.likedBy.includes(verifiedUser._id)){
            existingVideo.likedBy.pop(verifiedUser._id)
            existingVideo.likes -= 1;
        }

        const updatedData = await existingVideo.save();

        return res.status(200).json({
            videoId : updatedData._id,
            dislikes:  updatedData.dislikes,
            likes : updatedData.likes
        })
             
    } catch (error) {
        res.status(500).json({
            error
        })
    }
})


router.put("/view/:videoId", async(req, res) => {
    try {
        const existingVideo = await VideoModel.findById(req.params.videoId)
    
        existingVideo.views += 1
        const updatedData = await existingVideo.save() 

        return res.status(200).json({
            videoId : updatedData._id,
            views:  updatedData.views
        })


    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router