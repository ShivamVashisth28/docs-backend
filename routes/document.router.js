import { Router } from "express";
import {addContent, createDocument, deleteDocument, documentTitle, generateInviteCode, getContent, getUserType, renameDocument, validateInviteCode} from "../controllers/document.controller.js"

const router = Router()

router.route('/create').post(createDocument)
router.route('/getTitle').get(documentTitle)
router.route('/content').post(addContent)
router.route('/content').get(getContent)
router.route('/rename').post(renameDocument)
router.route('/delete').delete(deleteDocument)
router.route('/userType').get(getUserType)
router.route('/inviteCode').get(generateInviteCode)
router.route('/inviteCode').post(validateInviteCode)


export default router