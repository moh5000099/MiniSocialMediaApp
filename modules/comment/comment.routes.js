import { Router } from "express";
import { auth } from "../../middlewares/authentications.js";
import * as allFn from "./comment.controller.js"

import { asyncHandler } from "../../utils/errorHandling.js";
// import { fileFilter, myMulter, myMulterCloud } from "../../services/localMulter.js";


const router = Router();

router.post('/addComment/:postId',auth(),asyncHandler(allFn.addCommentFn));
router.put('/updateComment/:commentId',auth(),asyncHandler(allFn.updateCommentFn));
router.delete('/deleteComment/:commentId',auth(),asyncHandler(allFn.deleteCommentFn));

export default router;