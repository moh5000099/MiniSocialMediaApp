import { model, Schema } from "mongoose";

const commentSchema = new Schema({
    commentBody:{
        type:String,
        required:true
    },
    postId:{
        type:Schema.Types.ObjectId,
        ref:"post",
        required:true
    },
    replies:[{
        type:Schema.Types.ObjectId,
        ref:"reply",
    }],
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },

},{
    timestamps:true
});

export const commentModel = model("comment",commentSchema);