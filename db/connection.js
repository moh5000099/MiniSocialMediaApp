import mongoose from "mongoose";

export const dbConnection = async()=>{
    return await mongoose.connect(process.env.DB_BASE_URL)
    .then(()=>console.log("db connected........"))
    .catch((error)=>console.log({message:"db connection error", error}))
}
