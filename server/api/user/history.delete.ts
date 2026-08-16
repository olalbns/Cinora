export default defineEventHandler(async(event)=>{const user=await requireUser(event);await dbQuery('DELETE FROM user_history WHERE user_id=$1',[user.id]);return {ok:true}})
