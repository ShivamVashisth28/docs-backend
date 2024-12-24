import { Router } from "express";
import { getDetails, getDocuments, loginUser, logoutUser, signupUser } from "../controllers/user.controller.js"

const router = Router()

router.route('/signup').post(signupUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)
router.route('/getUserDetails').get(getDetails)
router.route('/getUserDocuments').get(getDocuments)

export default router