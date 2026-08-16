export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event); const page = Math.max(1,Number(body.page||1)), perPage=Math.min(50,Number(body.perPage||20)); const values:any[]=[`%${String(body.keyword||'')}%`]; let where='s.published=true AND (s.title ILIKE $1 OR s.description ILIKE $1)'; if (Number(body.subjectType)>0) { values.push(Number(body.subjectType)); where+=` AND s.subject_type=$${values.length}` }
  return apiOk(await listObservedSubjects(where,values,'s.popularity DESC',page,perPage))
})
