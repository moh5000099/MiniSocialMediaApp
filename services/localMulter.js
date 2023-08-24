import multer from 'multer'
import { nanoid } from 'nanoid'

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import fs from 'fs'
import { userModel } from '../db/models/user.model.js';

export const fileFilter = {
    image: ['image/jpeg', 'image/jpg', 'image/png'],
    file: ['application/pdf']
}

export const myMulter = ({ customPath = 'general', customFilter = fileFilter.image, userCheck = false } = {}, next) => {

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let fullPath = null;
            if (userCheck) {
                fullPath = path.join(__dirname, `../uploads/${req.user.email}/${customPath}`)
            } else {
                fullPath = path.join(__dirname, `../uploads/${customPath}`)
            }
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true })
            }
            cb(null, fullPath)
        },
        filename: (req, file, cb) => {
            const uniqueName = nanoid(7) + '__' + file.originalname
            cb(null, uniqueName)
        }
    });

    const fileFilter = async(req, file, cb) => {
            if (req.user.profilePicture) {
                fs.unlink(req.user.profilePicture, async (err) => {
                    if (err) {
                        const updatedUser = await userModel.updateOne({ _id: req.user._id }, { profilePicture: null })
                        if (updatedUser.modifiedCount) {
                            return cb(Error(`Error with removing old picture (it's fixed..Please Try Again): ${err}`, { cause: 400 }), false);
                        }
                        return cb(Error(`Error with removing old picture: ${err}`, { cause: 400 }), false);
                    }
                })
            }
        if (!customFilter.includes(file.mimetype)) {
            return cb(Error("File type is not available", { cause: 401 }), false);
        }
        cb(null, true);
    }

    const upload = multer({ fileFilter, storage })
    return upload
}


export const myMulterCloud = ({ customFilter = fileFilter.image } = {}, next) => {


    const storage = multer.diskStorage({});

    const fileFilter = (req, file, cb) => {
        if (!customFilter.includes(file.mimetype)) {
            return cb(Error("File type is not available", { cause: 401 }), false);
        }
        cb(null, true);
    }

    const upload = multer({ fileFilter, storage })
    return upload
}