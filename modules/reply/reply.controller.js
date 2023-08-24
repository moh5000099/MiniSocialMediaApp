import cloudinary from '../../utils/cloudinary.js'
import { commentModel } from "../../db/models/comment.model.js";
import { replyModel } from "../../db/models/reply.model.js";
import { deleteRepliesTail } from '../../utils/deleteReplyTails.js';



export const addReplytoCommentFn = async (req, res, next) => {
    const { replyBody } = req.body;
    const { commentId } = req.params;
    const { _id } = req.user;
    const commentCheck = await commentModel.findById(commentId)
    if (!commentCheck) {
        return next(Error("Comment not found !", { cause: 401 }));
    }
    const newReply = new replyModel({ replyBody, commentId, createdBy: _id, replyId: null });
    const savedReply = await newReply.save();
    const commentReplied = await commentModel.findByIdAndUpdate(commentId, { $addToSet: { replies: savedReply._id } }, { new: true })
    if (commentReplied && savedReply) {
        res.json({ message: "Reply to comment Add Done !", commentReplied })
    } else {
        next(Error("Reply to comment Add Fail !", { cause: 401 }));
    }
}
export const addReplytoReplyFn = async (req, res, next) => {
    const { replyBody } = req.body;
    const { replyId } = req.params;
    const { _id } = req.user;
    const ReplyCheck = await replyModel.findById(replyId)
    if (!ReplyCheck) {
        return next(Error("Reply not found !", { cause: 401 }));
    }
    const newReply = new replyModel({ replyBody, replyId, createdBy: _id, commentId: null });
    const savedReply = await newReply.save();
    const replyReplied = await replyModel.findByIdAndUpdate(replyId, { $addToSet: { replies: savedReply._id } }, { new: true })
    if (replyReplied && savedReply) {
        res.json({ message: "Reply to reply Add Done !", replyReplied })
    } else {
        next(Error("Reply to reply Add Fail !", { cause: 401 }));
    }
}


export const updateReplyFn = async (req, res, next) => {
    const { replyBody } = req.body;
    const { replyId } = req.params;
    const { _id } = req.user;

    const replyCheck = await replyModel.findOneAndUpdate({ _id: replyId, createdBy: _id }, { replyBody }, { new: true })
    if (replyCheck) {
        res.json({ message: "Reply Update Done !", replyCheck })
    } else {
        next(Error("Reply Update Fail !", { cause: 401 }));
    }
}

export const deleteReplyFn = async (req, res, next) => {
    const { replyId } = req.params;
    const { _id } = req.user;

    const replyCheck = await replyModel.findOneAndDelete({ _id: replyId, createdBy: _id })
    if (!replyCheck) {
        return next(Error("Reply Delete Fail !", { cause: 401 }));
    }
    deleteRepliesTail({...replyCheck.toObject()})
    if (replyCheck.commentId) {
        const commentUpdated = await commentModel.findByIdAndUpdate(replyCheck.commentId, { $pull: { replies: replyId } }, { new: true });
        res.json({ message: "Reply Delete Done !", commentUpdated })
    } else if (replyCheck.replyId) {
        const replyUpdated = await replyModel.findByIdAndUpdate(replyCheck.replyId, { $pull: { replies: replyId } }, { new: true });
        res.json({ message: "Reply Delete Done !", replyUpdated })
    }
}
