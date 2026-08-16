import pg from 'pg'

let pool: pg.Pool | undefined

export function database(): pg.Pool {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = new pg.Pool({
      connectionString: String(config.databaseUrl),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    })
    pool.on('error', error => console.error('[postgres]', error))
  }
  return pool
}

export async function dbQuery<T extends pg.QueryResultRow = any>(text: string, values: unknown[] = []): Promise<pg.QueryResult<T>> {
  return await database().query<T>(text, values)
}

export async function databaseHealth(): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = performance.now()
  try {
    await dbQuery('SELECT 1')
    return { ok: true, latency: Math.round(performance.now() - start) }
  } catch (error: any) {
    return { ok: false, latency: Math.round(performance.now() - start), error: error?.message }
  }
}
