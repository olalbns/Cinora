export default defineEventHandler(async(event)=>{requireAdmin(event);await dbQuery('DELETE FROM subjects WHERE id=$1',[String(getRouterParam(event,'id'))]);return {ok:true}})
