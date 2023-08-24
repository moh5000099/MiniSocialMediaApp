import { model, Schema } from "mongoose";

const replySchema = new Schema({
    replyBody:{
        type:String,
        required:true
    },
    commentId:{
        type:Schema.Types.ObjectId,
        ref:"comment",
    },
    replyId:{
        type:Schema.Types.ObjectId,
        ref:"reply",
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

export const replyModel = model("reply",replySchema);