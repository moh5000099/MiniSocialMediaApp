import { replyModel } from "../db/models/reply.model.js"

export const deleteRepliesTail = async(deletedOne)=>{
    console.log(deletedOne);
    if (deletedOne.replies.length) {
        for (const replyIdIndex of deletedOne.replies) {
            const deletedReply = await replyModel.findByIdAndDelete(replyIdIndex)
            deleteRepliesTail(deletedReply)
        }
    }else{
        return
    }
}