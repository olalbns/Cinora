export default defineEventHandler(async () => {
  const [platforms, sections] = await Promise.all([dbQuery('SELECT name,upload_by FROM platforms WHERE active=true ORDER BY position'), dbQuery('SELECT * FROM home_sections WHERE active=true ORDER BY position')])
  const operatingList = []
  for (const section of sections.rows) {
    const rows = await dbQuery('SELECT s.*, (SELECT count(*)::int FROM seasons se WHERE se.subject_id=s.id) season_count FROM subjects s JOIN home_section_items hi ON hi.subject_id=s.id WHERE hi.section_id=$1 AND s.published=true ORDER BY hi.position', [section.id])
    const subjects = rows.rows.map(observedSubject)
    const base = { type: section.section_type, position: section.position, title: section.title, subjects: section.section_type === 'BANNER' ? [] : subjects, banner: null as any, opId: section.id, url: '', liveList: [], filters: [], customData: null, genreTopId: '', detailPath: '' }
    if (section.section_type === 'BANNER') base.banner = { items: subjects.map((subject,index) => ({ id: `${section.id}-${index}`, title: subject.title, image: subject.stills || subject.cover, url: '', subjectId: subject.subjectId, subjectType: subject.subjectType, subject, detailPath: subject.detailPath })) }
    operatingList.push(base)
  }
  const genres = await dbQuery("SELECT DISTINCT unnest(genres) genre FROM subjects WHERE published=true ORDER BY genre LIMIT 12")
  operatingList.push({ type: 'FILTER', position: 99, title: 'Catégories', subjects: [], banner: null, opId: 'genres', url: '', liveList: [], filters: genres.rows.map(value => ({ title: value.genre, url: `/browse?genre=${encodeURIComponent(value.genre)}`, query: value.genre, image: { url:'',width:0,height:0,size:0,format:'',thumbnail:'',blurHash:'',gif:null,avgHueLight:'',avgHueDark:'',id:value.genre } })), customData: null, genreTopId: '', detailPath: '' })
  return apiOk({ platformList: platforms.rows.map(value => ({ name: value.name, uploadBy: value.upload_by })), operatingList })
})
