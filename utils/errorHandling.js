let stackVar;
export const asyncHandler = (API)=>{

    return (req,res,next)=>{
        API(req,res,next)
        .catch((err)=>{
            stackVar = err.stack;
            if(err.code == 11000){
                // return res.status(409).json({Message:"Email already exists !"})
                next(Error("Email or UserName already exists !",{cause:409}))
            }
            // res.status(500).json({Message:"Catch Error !!", Error_Message:err.message, Error_Stack:err.stack})
            if(err.message){
                return next(Error(err.message))
            }
            next(Error(err))
        })
    }

}
export {stackVar}