import { Router } from "express";
import { auth } from "../../middlewares/authentications.js";
import * as allFn from "./reply.controller.js"

import { asyncHandler } from "../../utils/errorHandling.js";
// import { fileFilter, myMulter, myMulterCloud } from "../../services/localMulter.js";


const router = Router();

router.post('/addReplytoComment/:commentId',auth(),asyncHandler(allFn.addReplytoCommentFn));
router.post('/addReplytoReply/:replyId',auth(),asyncHandler(allFn.addReplytoReplyFn));

router.put('/updateReply/:replyId',auth(),asyncHandler(allFn.updateReplyFn));
router.delete('/deleteReply/:replyId',auth(),asyncHandler(allFn.deleteReplyFn));

export default router;