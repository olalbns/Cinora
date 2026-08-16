export default defineEventHandler(async(event)=>{requireAdmin(event);return {items:(await dbQuery('SELECT * FROM blog_posts ORDER BY created_at DESC')).rows}})
