import { Router } from "express";
import { auth } from "../../middlewares/authentications.js";
import * as allFn from "./post.controller.js"
import * as postSchema from './post.validation.js'

import { validation } from "../../middlewares/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
// import { fileFilter, myMulter, myMulterCloud } from "../../services/localMulter.js";


const router = Router();

router.post('/addPost',auth(), validation(postSchema.addPost),asyncHandler(allFn.addPostFn));
router.delete('/deletePost/:postId',auth(),asyncHandler(allFn.deletePostFn));
router.put('/updatePost/:postId',auth(),validation(postSchema.addPost),asyncHandler(allFn.updatePostFn));
router.get('/getAllPosts',auth(),asyncHandler(allFn.getAllPostsFn));
router.get('/getMyPosts',auth(),asyncHandler(allFn.getMyPostsFn));

router.post('/addLike/:postId',auth(),asyncHandler(allFn.addLikeFn));
router.post('/removeLike/:postId',auth(),asyncHandler(allFn.removeLikeFn));


export default router;