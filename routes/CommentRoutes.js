const express = require("express");
const checkAuth = require('../middleware/CheckAuth');
const CommentModel = require('../models/CommentModel');
const { default: mongoose } = require("mongoose");
const router = express.Router();

router.put("/:videoId", checkAuth, async(req, res) => {
    try {
        const newComment = new CommentModel({
            _id: new mongoose.Types.ObjectId,
            commentText: req.body.commentText,
            userId: req.user._id,
            videoId: req.params.videoId
        })

        const uploadedComment = await newComment.save();
        return res.status(200).json({
            userId : uploadedComment.userId,
            videoId : uploadedComment.videoId,
            comment : uploadedComment.commentText
        })

    } catch (error) {
        res.status(500).join(error)
    }
})

router.get("/:videoId", async(req, res) => {
    try {
        
        const comments = await CommentModel.find({videoId:req.params.videoId}).populate('userId',"channelName logoUrl")

        return res.status(200).json(comments)

    } catch (error) {
        res.status(500).json(error)
    }
})

router.put("/edit/:commentId", checkAuth, async(req, res) => {
    try {
        
        const reqUser = req.user
        const comment = await CommentModel.findById(req.params.commentId)

        if(reqUser._id == comment.userId){
            const commentToBeUpdated = {
                commentText: req.body.commentText
            }
            await CommentModel.findByIdAndUpdate(req.params.commentId,commentToBeUpdated)
        }else{
            return res.status(400).json({
                message:"You cannot update someones commment !!"
            })
        }

        return res.status(200).json({
            message: "comment updated successfully :)"
        })

    } catch (error) {
        res.status(500).json(error)
    }
})


router.delete("/:commentId", checkAuth, async(req, res) => {
    try {
        
        const reqUser = req.user
        const comment = await CommentModel.findById(req.params.commentId)

        if(reqUser._id == comment.userId){
            await CommentModel.findByIdAndDelete(req.params.commentId)
        }else{
            return res.status(400).json({
                message:"You cannot delete someones commment !!"
            })
        }

        return res.status(200).json({
            message: "comment deleted successfully!"
        })

    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router 