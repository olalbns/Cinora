export default defineEventHandler((event) => {
  setHeader(event,'X-Content-Type-Options','nosniff')
  setHeader(event,'X-Frame-Options','DENY')
  setHeader(event,'Referrer-Policy','strict-origin-when-cross-origin')
  setHeader(event,'Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()')
  setHeader(event,'Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https:; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
  const forwarded=getHeader(event,'x-forwarded-proto')?.split(',')[0]?.trim()
  if(forwarded==='https'||getRequestURL(event).protocol==='https:')setHeader(event,'Strict-Transport-Security','max-age=31536000; includeSubDomains')
})
