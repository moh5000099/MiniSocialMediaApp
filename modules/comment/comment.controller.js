import { userModel } from "../../db/models/user.model.js";
import cloudinary from '../../utils/cloudinary.js'
import { postModel } from "../../db/models/post.model.js";
import { commentModel } from "../../db/models/comment.model.js";
import { postRoles } from "../../utils/systemRoles.js";
import { replyModel } from "../../db/models/reply.model.js";
import { deleteRepliesTail } from "../../utils/deleteReplyTails.js";



export const addCommentFn = async (req, res, next) => {
    const { commentBody } = req.body;
    const { postId } = req.params;
    const { _id } = req.user;
    const postCheck = await postModel.findById(postId)
    if (!postCheck) {
        return next(Error("Post not found !", { cause: 401 }));
    }
    const newComment = new commentModel({ commentBody, postId, createdBy: _id });
    const savedComment = await newComment.save();
    const postCommented = await postModel.findOneAndUpdate({ $or: [{ _id: postId, role: postRoles.PUBLIC }, { _id: postId, role: postRoles.PRIVATE, createdBy: _id }] }, { $addToSet: { comments: savedComment._id } }, { new: true })
    if (postCommented && savedComment) {
        res.json({ message: "Comment Add Done !", postCommented })
    } else {
        next(Error("Comment Add Fail !", { cause: 401 }));
    }
}

export const updateCommentFn = async (req, res, next) => {
    const { commentBody } = req.body;
    const { commentId } = req.params;
    const { _id } = req.user;

    const commentCheck = await commentModel.findOneAndUpdate({ _id: commentId, createdBy: _id }, { commentBody }, { new: true })
    if (commentCheck) {
        res.json({ message: "Comment Update Done !", commentCheck })
    } else {
        next(Error("Comment Update Fail !", { cause: 401 }));
    }
}

export const deleteCommentFn = async (req, res, next) => {
    const { commentId } = req.params;
    const { _id } = req.user;

    const commentCheck = await commentModel.findOneAndDelete({ _id: commentId, createdBy: _id })
    if (!commentCheck) {
        return next(Error("Comment Delete Fail !", { cause: 401 }));
    }
    deleteRepliesTail({...commentCheck.toObject()});
    const postUpdated = await postModel.findByIdAndUpdate(commentCheck.postId, { $pull: { comments: commentId } }, { new: true })
    res.json({ message: "Comment Delete Done !", postUpdated })
}
