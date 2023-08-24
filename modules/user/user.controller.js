import { userModel } from "../../db/models/user.model.js"
import bcrypt from "bcryptjs"
import { tokenFunction } from "../../utils/tokenFunction.js";
import { sendEmail } from "../../services/sendEmail.js";

import fs from 'fs'
import cloudinary from "../../utils/cloudinary.js";
import { userRoles } from "../../utils/systemRoles.js";

let randomCode = '';


// in case of saving the email with verification
export const signUpFn = async (req, res) => {
    const { firstName, lastName, userName, email, password } = req.body;
    const userCheck = await userModel.findOne({ $or: [{ email }, { userName }] })
    if (userCheck) {
        res.json({ msg: 'Email or UserName exists  !' })
    } else {
        const hashPassword = bcrypt.hashSync(password, +process.env.SALT_ROUND);
        const newUser = { firstName, lastName, userName, email, password: hashPassword };
        const token = tokenFunction({ payload: { newUser } });
        const myUrl = `${req.protocol}://${req.headers.host}/api/user/confirmEmail/${token}`;
        const message = `<a href =${myUrl}>Click to Confirm</a>`
        const emailSent = await sendEmail({ to: email, subject: "Email Verification", message })
        if (emailSent) {
            return res.json({ msg: 'Verification Email Sent', data: newUser });
        }
        next(Error("email send fail", { cause: 500 }))
    }
}

export const forgetPasswordFn = async (req, res, next) => {
    const { email } = req.body;
    const userCheck = await userModel.findOne({ email })
    if (!userCheck) {
        return next(Error("Email doesn't exist", { cause: 500 }))
    }
    randomCode = randomCodeFn(5);
    const token = tokenFunction({ payload: { email } }); //or random code
    const message = `<p>Use This Code to Verify: <span>${randomCode}__${token}</span></p>`
    const emailSent = await sendEmail({ to: email, subject: "Password Code Verification", message })
    if (emailSent) {
        return res.json({ msg: 'Verification Code Sent' });
    }
    next(Error("email send fail", { cause: 500 }))

}


// in case of saving the email with verification
export const confirmEmailFn = async (req, res, next) => {
    const { token } = req.params;
    const decode = tokenFunction({ payload: token, generate: false });
    if (decode?.newUser) {
        const myNewUser = new userModel({ ...decode.newUser, verified: true });
        const savedNewUser = await myNewUser.save()
        if (savedNewUser) {
            return res.json({ msg: 'Email Verified and User Saved..Please Login', data: savedNewUser });
        }
        return next(Error("User isn't found or is verified !!", { cause: 401 }));
    }
    next(Error("Invalid User Token", { cause: 500 }));
}

export const signInFn = async (req, res, next) => {
    const { email, password } = req.body;
    const userCheck = await userModel.findOne({ email });
    if (!userCheck) {
        return res.json({ message: "Email not found !" });
    }
    const passCheck = bcrypt.compareSync(password, userCheck.password);
    if (!passCheck) {
        return res.json({ message: "Password not correct !" });
    }
    if (!userCheck.verified) {
        return next(Error("Please verify your email first !", { cause: 401 }))
    }
    await userModel.updateOne({ email }, { isLoggedIn: true })
    const token = tokenFunction({ payload: { email, id: userCheck._id }, expiresIn: 0 }); // expiresIn => 0 it will generate the token without expiration
    if (token) {
        res.json({ message: "Login Success !", token });
    } else {
        res.json({ message: "Token generation fail !" });
    }
}

export const deleteUserFn = async (req, res, next) => {
    const { _id } = req.params;
    const userCheck = await userModel.findByIdAndDelete({ _id });
    if (!userCheck) {
        return next(Error("User not found !", { cause: 401 }));
    }
    res.json({ message: "delete Success !" });

}


export const updateUserFn = async (req, res, next) => {
    const { firstName, lastName } = req.body;
    const { _id } = req.user;

    const userCheck = await userModel.findByIdAndUpdate(_id, { firstName, lastName }, { new: true });
    if (!userCheck) {
        return next(Error("User not found !", { cause: 401 }));
    }
    res.json({ message: "Update Done !", userCheck });

}

export const changeRoleFn = async (req, res, next) => {

    const { role } = req.body;
    const { key } = req.params;
    const { _id } = req.user;
    if (key != process.env.CHANEG_ROLE_KEY) {
        return next(Error("Wrong Role Key !", { cause: 403 }));
    }
    if (!Object.values(userRoles).includes(role)) {
        return next(Error("In-Valid Role Name!", { cause: 403 }));
    }
    const userCheck = await userModel.findByIdAndUpdate(_id, { role }, { new: true });
    if (!userCheck) {
        return next(Error("User not found !", { cause: 401 }));
    }
    res.json({ message: "Update Done !", userCheck });

}

export const changePasswordFn = async (req, res, next) => {
    const { oldpassword, password } = req.body;
    const { _id } = req.user;
    const passCheck = bcrypt.compareSync(oldpassword, req.user.password);
    if (!passCheck) {
        return next(Error("Old Password is not correct ! !", { cause: 401 }))
    }
    const newHashPassword = bcrypt.hashSync(password, +process.env.SALT_ROUND);
    const userCheck = await userModel.findByIdAndUpdate(_id, { password: newHashPassword }, { new: true });
    if (!userCheck) {
        return next(Error("User not found !", { cause: 401 }))
    }
    return res.json({ message: "Change Password Done !", userCheck });
}

export const confirmForgottenPasswordFn = async (req, res, next) => {
    const { password } = req.body;
    const { code } = req.params; //or the random code
    if (randomCode == null) {
        return next(Error("Please try again !!", { cause: 401 }));
    }
    //for token as a code
    const decode = tokenFunction({ payload: code.split('__')[1], generate: false });
    if (decode?.email) { // the code is correct
        if (code.split('__')[0] == randomCode) {
            const hashPassword = bcrypt.hashSync(password, +process.env.SALT_ROUND);
            const user = await userModel.findOneAndUpdate({ email: decode.email, verified: true }, { password: hashPassword }, { new: true });
            randomCode = null;
            return res.json({ message: "Change Password Done !", user });
        } else {
            return next(Error("User code isn't correct...Please try again !!", { cause: 401 }));
        }
    }
    next(Error("Invalid User Token", { cause: 500 }));

}

export const logoutFn = async (req, res) => {
    try {
        const { _id } = req.user;
        const userCheck = await userModel.findByIdAndUpdate({ _id }, { isLoggedIn: false }, { new: true });
        if (userCheck?.isLoggedIn) {
            return res.json({ message: "Logged Out Fail !" });
        }
        res.json({ message: "Logged Out Successfully !" });
    } catch (error) {
        console.log(error);
        res.json({ message: "Catch Error !", error })
    }
}



export const uploadProfilePicCloudFn = async (req, res, next) => {
    const { _id } = req.user;
    const { customPath = 'profilePic' } = req.body;
    // it would be less buggy if we delete according to public_id if exists
    // and whatever the result we put null to profilePictureCloudId and profilePicture
    // then we add the new pic on clean path, instead of replace by public_id
    if (req.file) {
        let image = {};
        if (req.user.profilePictureCloudId) {
            image = await cloudinary.uploader.upload(req.file.path, {
                folder: ``,
                public_id: req.user.profilePictureCloudId
            })
        } else {
            image = await cloudinary.uploader.upload(req.file.path, {
                folder: `uploads/${req.user.email}/${customPath}`
            })
        }
        const { secure_url, public_id } = image;
        const userUpdate = await userModel.findByIdAndUpdate({ _id }, { profilePicture: secure_url, profilePictureCloudId: public_id }, { new: true });
        if (!userUpdate) {
            return next(Error("User not found !", { cause: 401 }));
        }
        return res.json({ message: "Profile Picture Uploaded Successfully !", file: req.file });
    }
    next(Error("Profile Picture Uploaded FAILLL !", { cause: 500 }));
}
export const uploadCoverPicsCloudFn = async (req, res, next) => {
    const { _id } = req.user;
    const { customPath = 'coverPics' } = req.body;
    // it would be less buggy if we delete according to public_id if exists
    // and whatever the result we put null to profilePictureCloudId and profilePicture
    // then we add the new pic on clean path, instead of replace by public_id
    if (!req.files) {
        next(Error("Profile Picture Uploaded FAILLL !", { cause: 500 }));
    }
    let coverPictures = [];
    let coverPicturesCloudId = [];
    for (const file of req.files) {
                const {secure_url, public_id} = await cloudinary.uploader.upload(file.path,{
                    folder: `uploads/${req.user.email}/${customPath}`
                });
                coverPictures.push(secure_url);
                coverPicturesCloudId.push(public_id)
    }


    const userUpdate = await userModel.findByIdAndUpdate({ _id }, {coverPictures, coverPicturesCloudId }); // get the old data to use it
    if(userUpdate.coverPicturesCloudId.length){
        await cloudinary.api.delete_resources(userUpdate.coverPicturesCloudId)
    }
    if (!userUpdate) {
        return next(Error("User not found !", { cause: 401 }));
    }
    return res.json({ message: "Cover Pictures Uploaded Successfully !", files: req.files });

}

export const deleteProfilePicCloudFn = async (req, res, next) => {
    const { _id } = req.user;
    if (!req.user.profilePictureCloudId) {
        return next(Error("There's no profile picture !", { cause: 401 }));
    }
    const deleted = await cloudinary.uploader.destroy(req.user.profilePictureCloudId)
    if (deleted.result != 'ok') {
        return next(Error("Error Deleting profile Picture !", { cause: 401 }));
    }
    const userUpdate = await userModel.findByIdAndUpdate(_id, { profilePicture: null, profilePictureCloudId: null }, { new: true });
    if (!userUpdate) {
        return next(Error("User not found !", { cause: 401 }));
    }
    res.json({ message: "Profile Picture Deleted Successfully !"});

}
export const deleteCoverPicsCloudFn = async (req, res, next) => {
    const { _id } = req.user;
    if (!req.user.coverPicturesCloudId.length) {
        return next(Error("There's no cover pictures !", { cause: 401 }));
    }
    await cloudinary.api.delete_resources(req.user.coverPicturesCloudId)
    const userUpdate = await userModel.findByIdAndUpdate(_id, { coverPictures: [], coverPicturesCloudId: [] }, { new: true });
    if (!userUpdate) {
        return next(Error("User not found !", { cause: 401 }));
    }
    res.json({ message: "Cover Pictures Deleted Successfully !"});

}


//random code function equivilant to nanoid
function randomCodeFn(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}