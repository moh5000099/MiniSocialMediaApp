import { userModel } from "../../db/models/user.model.js";
import cloudinary from '../../utils/cloudinary.js'
import { postModel } from "../../db/models/post.model.js";
import { postRoles } from "../../utils/systemRoles.js";
import { commentModel } from "../../db/models/comment.model.js";
import { deleteRepliesTail } from "../../utils/deleteReplyTails.js";


export const addPostFn = async (req, res, next) => {
    const { title, text, role } = req.body;
    const {_id} = req.user;
    const newPost = new postModel({ title, text, role, createdBy:_id });
    const savedPost = await newPost.save();
    if (savedPost) {
        res.json({ message: "Added Done !", savedPost })
    } else {
        next(Error("Added Fail !", { cause: 500 }));
    }
}

export const deletePostFn = async (req, res, next) => {
    const { postId } = req.params;
    const {_id} = req.user;
    const deletedPost = await postModel.findOneAndDelete({ _id: postId,  createdBy:_id });
    if (deletedPost) {
        if(deletedPost.comments.length){
            for(const commentIdIndex of deletedPost.comments){
                const deletedComment = await commentModel.findByIdAndDelete(commentIdIndex);
                if (!deletedComment) {
                    return next(Error("Reply Delete Fail !", { cause: 401 }));
                }
                deleteRepliesTail({...deletedComment.toObject()});
            }
        }
        res.json({ message: "Deleted Done !", deletedPost })
    } else {
        next(Error("Deleted Fail !", { cause: 401 }));
    }
}

export const updatePostFn = async (req, res, next) => {
    const { postId } = req.params;
    const { title, text, role } = req.body;
    const {_id} = req.user;
    const updatedPost = await postModel.findOneAndUpdate({ _id: postId,  createdBy:_id },{ title, text, role }, {new:true});
    if (updatedPost) {
        res.json({ message: "Updated Done !", updatedPost })
    } else {
        next(Error("Updated Fail !", { cause: 500 }));
    }
}

export const getAllPostsFn = async (req, res, next) => {
    const {_id} = req.user;
    const posts = await postModel.find({$or:[{role:postRoles.PUBLIC},{role:postRoles.PRIVATE,createdBy:_id}]}).populate([{
        path:'createdBy',
        select:'userName'
    },{
        path:'comments',
        select:'commentBody createdBy replies',
        populate:[{
            path:'createdBy',
            select:'userName'
        },{
            path:'replies',
            select:'replyBody createdBy replies',
            populate:[{
                path:'createdBy',
                select:'userName'
            },{
                path:'replies',
                select:'replyBody createdBy',
                populate:{
                    path:'createdBy',
                    select:'userName'
                }
            }]
        }]
    }]).select('title text createdBy comments')
    if (posts.length) {
        res.json({ message: "All Posts Done !", posts })
    } else {
        next(Error("There's no posts !", { cause: 400 }));
    }
}
export const getMyPostsFn = async (req, res, next) => {
    const {_id} = req.user;
    const posts = await postModel.find({createdBy:_id})
    if (posts.length) {
        res.json({ message: "My Posts Done !", posts })
    } else {
        next(Error("There's no posts !", { cause: 400 }));
    }
}


export const addLikeFn = async (req, res, next) => {
    const { postId } = req.params;
    const {_id} = req.user;
    const updatedPost = await postModel.findOneAndUpdate({$or:[{_id:postId,role:postRoles.PUBLIC},{_id:postId,role:postRoles.PRIVATE,createdBy:_id}],likedBy:{$ne:_id}},{$addToSet:{likedBy:_id}}, {new:true});
    if (updatedPost) {
        res.json({ message: "Liekd Done !", updatedPost, totalLikes:updatedPost.likedBy.length })
    } else {
        next(Error("Liked Fail !", { cause: 403 }));
    }
}

export const removeLikeFn = async (req, res, next) => {
    const { postId } = req.params;
    const {_id} = req.user;
    const updatedPost = await postModel.findOneAndUpdate({$or:[{_id:postId,role:postRoles.PUBLIC},{_id:postId,role:postRoles.PRIVATE,createdBy:_id}],likedBy:{$eq:_id}},{$pull:{likedBy:_id}}, {new:true});
    if (updatedPost) {
        res.json({ message: "Un-Liked Done !", updatedPost, totalLikes:updatedPost.likedBy.length })
    } else {
        next(Error("Un-Liked Fail !", { cause: 403 }));
    }
}
