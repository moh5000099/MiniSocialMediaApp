import { model, Schema } from "mongoose";
import { postRoles } from "../../utils/systemRoles.js";
const postSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    role:{
        type:String,
        default: postRoles.PUBLIC,
        enum: [postRoles.PUBLIC, postRoles.PRIVATE]
    },
    likedBy:[{
        type:Schema.Types.ObjectId,
        ref:"user"
    }],
    comments:[{
        type:Schema.Types.ObjectId,
        ref:"comment"
    }]
},{
    timestamps:true
});

export const postModel = model("post",postSchema);