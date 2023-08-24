import { model, Schema } from "mongoose";
import { userRoles } from "../../utils/systemRoles.js";

const userSchema = new Schema({
    firstName:String,
    lastName:String,
    userName:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    isLoggedIn:{
        type:Boolean,
        default:false
    },
    verified:{
        type:Boolean,
        default:false
    },
    profilePicture:{
        type:String,
        default:null
    },
    profilePictureCloudId:{
        type:String,
        default:null
    },
    coverPictures:[{
        type:String,
        default:null
    }],
    coverPicturesCloudId:[{
        type:String,
        default:null
    }],
    role:{
        type:String,
        default: userRoles.USER,
        enum: [userRoles.USER, userRoles.SUPER_USER]
    }
},{
    timestamps:true
});

export const userModel =  model.user || model("user",userSchema);