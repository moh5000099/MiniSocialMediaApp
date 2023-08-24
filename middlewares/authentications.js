import { userModel } from "../db/models/user.model.js";
import { tokenFunction } from "../utils/tokenFunction.js";

export const auth = ()=>{
    return async(req,res,next)=>{
        try {
            const {authorization} = req.headers;
            if(!authorization){
                return res.json({message:"Please enter your token !!"})
            }
            if(!authorization.startsWith(process.env.PREFIX_TOKEN)){
                return res.json({message:"Invalid prefix !!"})
            }
            const token = authorization.split(process.env.PREFIX_TOKEN)[1];
            const decoded = tokenFunction({payload:token,generate:false});
            if(!decoded || !decoded.id){
                return res.json({message:"Invalid token !!"})
            }
            const myUser = await userModel.findById(decoded.id)
            if(!myUser){
                return res.json({message:"User not found !!"})
            }
            if(!myUser.verified){
                return res.json({message:"Your email isn't verified yet !..Please verify your email"})
            }
            if(!myUser.isLoggedIn){
                return res.json({message:"You logged out !..Please login first"})
            }
            req.user = myUser;
            next();
        } catch (error) {
            res.json({message:"Catch Error in authentication !" ,error})
        }
    }
}