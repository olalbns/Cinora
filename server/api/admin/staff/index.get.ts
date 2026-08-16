export default defineEventHandler(async(event)=>{requireAdmin(event);const rows=await dbQuery('SELECT * FROM staff ORDER BY name');return {items:rows.rows}})
