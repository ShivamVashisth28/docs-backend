import { Router } from "express";
import {addContent, createDocument, deleteDocument, documentTitle, getContent, renameDocument} from "../controllers/document.controller.js"

const router = Router()

router.route('/create').post(createDocument)
router.route('/getTitle').get(documentTitle)
router.route('/content').post(addContent)
router.route('/content').get(getContent)
router.route('/rename').post(renameDocument)
router.route('/delete').delete(deleteDocument)

export default router