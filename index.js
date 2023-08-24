import express from 'express';
import { config } from 'dotenv';
import { dbConnection } from './db/connection.js';
import * as allRouters from "./modules/index.routes.js"
import { stackVar } from './utils/errorHandling.js';
config();
const app = express();
const port = process.env.PORT;
const baseUrl = "/api";
dbConnection();
app.use(express.json());

new Error("");

app.use(`${baseUrl}/user`,allRouters.userRouter);
app.use(`${baseUrl}/post`,allRouters.postRouter);
app.use(`${baseUrl}/comment`,allRouters.commentRouter);
app.use(`${baseUrl}/reply`,allRouters.replyRouter);
app.use(`${baseUrl}/uploads`,express.static('./uploads'));

app.use('*',(req,res,next)=>{
    // res.status(404).json({Message:"invalid router"})
    next(Error('invalid router',{cause:404}));
})

//error res
app.use((err,req,res,next)=>{
    if(err){
        console.log(err);
        res
        .status(err['cause'] || 500)
        .json({Message:"Faaaaail !!", Error_Message:err.message, Error_Stack: stackVar ,Stack_Response:err.stack})
    }
})

app.listen(port,()=>{
    console.log("Server is Running........");
});