import pg from 'pg'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const connectionString = process.env.DATABASE_URL || 'postgresql://cinora:cinora_dev@localhost:5432/cinora'
const pool = new pg.Pool({ connectionString })

async function migrate() {
  const directory = resolve('database')
  await pool.query('CREATE TABLE IF NOT EXISTS migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
  const files = (await readdir(directory)).filter(name => /^\d+.*\.sql$/.test(name)).sort()
  for (const name of files) {
    const exists = await pool.query('SELECT 1 FROM migrations WHERE name=$1', [name])
    if (exists.rowCount) { console.log(`skip ${name}`); continue }
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(await readFile(resolve(directory, name), 'utf8'))
      await client.query('INSERT INTO migrations(name) VALUES($1) ON CONFLICT DO NOTHING', [name])
      await client.query('COMMIT')
      console.log(`applied ${name}`)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally { client.release() }
  }
}

async function seed() {
  await pool.query(await readFile(resolve('database/seed.sql'), 'utf8'))
  console.log('seed completed')
}

try {
  const command = process.argv[2] || 'setup'
  if (command === 'migrate' || command === 'setup') await migrate()
  if (command === 'seed' || command === 'setup') await seed()
} finally { await pool.end() }
