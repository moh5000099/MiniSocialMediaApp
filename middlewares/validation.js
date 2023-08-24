import { asyncHandler } from "../utils/errorHandling.js";

export const validation = (schema)=>{

    return asyncHandler( async(req,res,next)=>{ //async here to return promise
            let validErrorArr =[];
            let validResult=false;
            const requestKeys = ['body','headers','params','query','files','file'];
            for (const key of requestKeys) {
                if(schema[key]){
                    validResult = schema[key].validate(req[key],{abortEarly:false})
                    if(validResult?.error?.details){
                        validErrorArr.push(validResult.error.details)
                    }
                }
            }

            if(validErrorArr.length){
            return res.json({message:'Validation Error !!!',Errors:validErrorArr})
            }
            next();
    })
}
