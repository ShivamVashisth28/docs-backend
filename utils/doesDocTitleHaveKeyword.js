import Document from "../models/document.model.js"

export const doesDocTitleHaveKeyword = async (docId, keyword) => {
    try {
        const doc = await Document.findOne({documentId:docId})
        if(!doc) return false

        if(doc.title.includes(keyword)){
            return true
        }
        else{
            return false
        }
    } catch (error) {
        throw new Error("error in filtering the docs");
    }
}