import { Router } from "express";
import { auth } from "../../middlewares/authentications.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { validation } from "../../middlewares/validation.js";
import * as allFn from "./user.controller.js"
import * as userSchema from './user.validation.js'
import { fileFilter, myMulter, myMulterCloud } from "../../services/localMulter.js";
import { authorization } from "../../middlewares/authorization.js";
import { endPoints } from "./user.endPoints.js";


const router = Router();

router.post('/signUp', validation(userSchema.signUp), asyncHandler(allFn.signUpFn));
router.get('/confirmEmail/:token', asyncHandler(allFn.confirmEmailFn));
router.post('/signIn', validation(userSchema.signIn), asyncHandler(allFn.signInFn));
router.post('/forgetPassword', validation(userSchema.forgetPassword), asyncHandler(allFn.forgetPasswordFn));
router.put('/confirmForgottenPassword/:code', validation(userSchema.setNewPassword), asyncHandler(allFn.confirmForgottenPasswordFn));
router.patch('/changePassword', validation(userSchema.changePassword), auth(), asyncHandler(allFn.changePasswordFn));
router.delete('/deleteUser/:_id', auth(),authorization(endPoints.DELETE_USER), asyncHandler(allFn.deleteUserFn));
router.put('/updateUser', auth(), asyncHandler(allFn.updateUserFn));
router.post('/logout', auth(), asyncHandler(allFn.logoutFn));
router.patch('/changeRole/:key', auth(), asyncHandler(allFn.changeRoleFn));

router.post('/uploadProfilePicCloud', auth(), myMulterCloud({
    customFilter: fileFilter.image
}).single('img'),
    asyncHandler(allFn.uploadProfilePicCloudFn));
router.post('/uploadCoverPicsCloud', auth(), myMulterCloud({
    customFilter: fileFilter.image
}).array('img'),
    asyncHandler(allFn.uploadCoverPicsCloudFn));

router.delete('/deleteProfilePicCloud', auth(), asyncHandler(allFn.deleteProfilePicCloudFn));
router.delete('/deleteCoverPicsCloud', auth(), asyncHandler(allFn.deleteCoverPicsCloudFn));

export default router;