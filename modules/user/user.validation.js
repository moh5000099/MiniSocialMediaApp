import Joi from 'joi';


export const signUp = {
    body:Joi.object().required().keys({
        firstName:Joi.string().min(2).max(10).required(),
        lastName:Joi.string().min(2).max(10).required(),
        userName:Joi.string().min(2).max(10).required(),
        email:Joi.string().email({tlds:{allow:['com','net']},maxDomainSegments:2}).required(),
        password:Joi.string().min(3).max(20).required(),
        cpassword:Joi.string().valid(Joi.ref('password')).required().messages({"any.only":"please check the cpassword "}),
    })
}

export const signIn = {
    body:Joi.object().required().keys({
        email:Joi.string().email({tlds:{allow:['com','net']},maxDomainSegments:2}).required(),
        password:Joi.string().min(3).max(20).required(),
    })
}

export const forgetPassword = {
    body:Joi.object().required().keys({
        email:Joi.string().email({maxDomainSegments:2}).required()
    })
}

export const changePassword = {
    body:Joi.object().required().keys({
        oldpassword:Joi.string().min(3).max(20).required(),
        password:Joi.string().min(3).max(20).required(),
        cpassword:Joi.string().valid(Joi.ref('password')).required().messages({"any.only":"please check the cpassword "}),
    })
}

export const setNewPassword = {
    body:Joi.object().required().keys({
        password:Joi.string().min(3).max(20).required(),
        cpassword:Joi.string().valid(Joi.ref('password')).required().messages({"any.only":"please check the cpassword "}),
    })
}