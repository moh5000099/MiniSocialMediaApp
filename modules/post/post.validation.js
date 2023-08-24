import Joi from 'joi'
import { postRoles } from '../../utils/systemRoles.js'

export const addPost = {
    body:Joi.object().required().keys({
        title:Joi.string().min(2).max(100).required(),
        text:Joi.string().min(2).max(100).required(),
        role:Joi.string().valid(postRoles.PRIVATE,postRoles.PUBLIC)
    })
}
