import dotenv from 'dotenv'
import path from 'path'

// Only load .env file in development/local environment
// Vercel provides environment variables automatically via dashboard
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })
}

import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set. Please configure it in your deployment platform (Vercel Dashboard → Settings → Environment Variables)')
}

const sql = neon(connectionString, {
  fetchConnectionCache: true,
})

// ====== Query Builder Helpers ======

type WhereCondition = Record<string, unknown>

function col(field: string): string {
  return `"${field}"`
}

interface BuildWhereResult {
  clauses: string[]
  params: unknown[]
}

function buildWhere(where: WhereCondition, paramStartIdx = 1): BuildWhereResult {
  const clauses: string[] = []
  const params: unknown[] = []
  let paramIdx = paramStartIdx

  for (const [key, value] of Object.entries(where)) {
    if (key === 'AND' && Array.isArray(value)) {
      const andResults = value.map((w: WhereCondition) => {
        const r = buildWhere(w, paramIdx)
        paramIdx += r.params.length
        params.push(...r.params)
        return r.clauses.join(' AND ')
      })
      clauses.push(`(${andResults.join(' AND ')})`)
    } else if (key === 'OR' && Array.isArray(value)) {
      const orResults = value.map((w: WhereCondition) => {
        const r = buildWhere(w, paramIdx)
        paramIdx += r.params.length
        params.push(...r.params)
        return r.clauses.join(' AND ')
      })
      clauses.push(`(${orResults.join(' OR ')})`)
    } else if (key === 'NOT' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const notResult = buildWhere(value as WhereCondition, paramIdx)
      paramIdx += notResult.params.length
      params.push(...notResult.params)
      const notClause = notResult.clauses.join(' AND ')
      clauses.push(`NOT (${notClause})`)
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Handle { contains, in, startsWith, not } operators
      const opValue = value as Record<string, unknown>

      // Handle field-level NOT operator: { key: { not: { startsWith: 'session:' } } }
      if (opValue.not !== undefined && typeof opValue.not === 'object' && opValue.not !== null) {
        // Build the inner condition and negate it
        const innerWhere = { [key]: opValue.not } as WhereCondition
        const innerResult = buildWhere(innerWhere, paramIdx)
        paramIdx += innerResult.params.length
        params.push(...innerResult.params)
        clauses.push(`NOT (${innerResult.clauses.join(' AND ')})`)
      } else if (opValue.contains !== undefined) {
        clauses.push(`${col(key)} ILIKE $${paramIdx}`)
        params.push(`%${opValue.contains}%`)
        paramIdx++
      } else if (opValue.in !== undefined) {
        const vals = opValue.in as unknown[]
        const placeholders = vals.map((_, i) => `$${paramIdx + i}`)
        clauses.push(`${col(key)} IN (${placeholders.join(', ')})`)
        params.push(...vals)
        paramIdx += vals.length
      } else if (opValue.startsWith !== undefined) {
        clauses.push(`${col(key)} ILIKE $${paramIdx}`)
        params.push(`${opValue.startsWith}%`)
        paramIdx++
      }
    } else {
      // Simple equality (including null)
      if (value === null || value === undefined) {
        clauses.push(`${col(key)} IS NULL`)
      } else {
        clauses.push(`${col(key)} = $${paramIdx}`)
        params.push(value)
        paramIdx++
      }
    }
  }

  return { clauses, params }
}

function buildOrderBy(orderBy: Record<string, string> | string): string {
  if (typeof orderBy === 'string') {
    if (orderBy === 'desc' || orderBy === 'asc') return `"createdAt" ${orderBy}`
    return `"${orderBy}"`
  }
  return Object.entries(orderBy)
    .map(([field, dir]) => `${col(field)} ${dir}`)
    .join(', ')
}

function filterSelect(row: Record<string, unknown>, select?: Record<string, boolean>): Record<string, unknown> {
  if (!select) return row
  const filtered: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(select)) {
    if (v && k in row) filtered[k] = row[k]
  }
  return filtered
}

// Generate a cuid-like ID (matches Prisma's @default(cuid()))
function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'c'
  const timestamp = Date.now().toString(36)
  id += timestamp
  for (let i = 0; i < 20; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

// Convert Date objects to ISO strings for PostgreSQL
function serializeValue(val: unknown): unknown {
  if (val instanceof Date) {
    return val.toISOString()
  }
  return val
}

// ====== Model Class ======

class Model {
  constructor(private tableName: string) {}

  private get qt(): string {
    return `"${this.tableName}"`
  }

  async findMany(args?: {
    where?: WhereCondition
    orderBy?: Record<string, string>
    select?: Record<string, boolean>
    skip?: number
    take?: number
    distinct?: string[]
  }): Promise<any[]> {
    const parts: string[] = ['SELECT']
    const params: unknown[] = []
    let paramIdx = 1

    if (args?.select) {
      const cols = Object.keys(args.select).filter(k => args.select![k]).map(col)
      parts.push(cols.join(', '))
    } else {
      parts.push('*')
    }

    parts.push(`FROM ${this.qt}`)

    if (args?.where && Object.keys(args.where).length > 0) {
      const w = buildWhere(args.where, paramIdx)
      parts.push(`WHERE ${w.clauses.join(' AND ')}`)
      params.push(...w.params)
      paramIdx += w.params.length
    }

    if (args?.distinct && args.distinct.length > 0) {
      parts.push(`GROUP BY ${args.distinct.map(col).join(', ')}`)
    }

    if (args?.orderBy) {
      parts.push(`ORDER BY ${buildOrderBy(args.orderBy)}`)
    }

    if (args?.skip) {
      parts.push(`OFFSET ${args.skip}`)
    }
    if (args?.take) {
      parts.push(`LIMIT ${args.take}`)
    }

    const query = parts.join(' ')
    return sql.query(query, params) as Promise<any[]>
  }

  async findFirst(args?: {
    where?: WhereCondition
    orderBy?: Record<string, string>
    select?: Record<string, boolean>
  }): Promise<any | null> {
    const results = await this.findMany({ ...args, take: 1 })
    return results[0] || null
  }

  async findUnique(args: { where: Record<string, string> }): Promise<any | null> {
    const results = await this.findMany({ where: args.where, take: 1 })
    return results[0] || null
  }

  async create(args: { data: Record<string, unknown>; select?: Record<string, boolean> }): Promise<any> {
    const data = { ...args.data }
    
    // Auto-generate id if not provided (matches Prisma @default(cuid()))
    if (!data.id) {
      data.id = generateId()
    }
    
    // Auto-set timestamps if not provided
    // Setting table only has updatedAt, not createdAt
    if (!data.updatedAt) {
      data.updatedAt = new Date().toISOString()
    }
    if (!data.createdAt && this.tableName !== 'Setting') {
      data.createdAt = new Date().toISOString()
    }

    const fields = Object.keys(data).filter(k => data[k] !== undefined)
    const values = fields.map(k => serializeValue(data[k]))
    const placeholders = fields.map((_, i) => `$${i + 1}`)
    const cols = fields.map(col)

    const query = `INSERT INTO ${this.qt} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`
    const results = await sql.query(query, values) as any[]
    return filterSelect(results[0], args.select)
  }

  async update(args: {
    where: Record<string, string | unknown>
    data: Record<string, unknown>
    select?: Record<string, boolean>
  }): Promise<any> {
    const data = { ...args.data }
    
    // Auto-set updatedAt
    data.updatedAt = new Date().toISOString()
    
    const fields = Object.keys(data).filter(k => data[k] !== undefined)
    let paramIdx = 1

    const setClauses = fields.map(f => `${col(f)} = $${paramIdx++}`)
    const setValues = fields.map(f => serializeValue(data[f]))

    const w = buildWhere(args.where as WhereCondition, paramIdx)
    const params = [...setValues, ...w.params]

    const query = `UPDATE ${this.qt} SET ${setClauses.join(', ')} WHERE ${w.clauses.join(' AND ')} RETURNING *`
    const results = await sql.query(query, params) as any[]
    return filterSelect(results[0], args.select)
  }

  async updateMany(args: {
    where: Record<string, unknown>
    data: Record<string, unknown>
  }): Promise<{ count: number }> {
    const data = args.data
    const fields = Object.keys(data).filter(k => data[k] !== undefined)
    let paramIdx = 1

    const setClauses = fields.map(f => `${col(f)} = $${paramIdx++}`)
    const setValues = fields.map(f => data[f])

    const w = buildWhere(args.where as WhereCondition, paramIdx)
    const params = [...setValues, ...w.params]

    const query = `UPDATE ${this.qt} SET ${setClauses.join(', ')} WHERE ${w.clauses.join(' AND ')} RETURNING id`
    const results = await sql.query(query, params) as any[]
    return { count: results.length }
  }

  async delete(args: { where: Record<string, string> }): Promise<any> {
    const w = buildWhere(args.where)
    const query = `DELETE FROM ${this.qt} WHERE ${w.clauses.join(' AND ')} RETURNING *`
    const results = await sql.query(query, w.params) as any[]
    return results[0]
  }

  async count(args?: { where?: WhereCondition }): Promise<number> {
    const parts: string[] = [`SELECT COUNT(*) as count FROM ${this.qt}`]
    const params: unknown[] = []

    if (args?.where && Object.keys(args.where).length > 0) {
      const w = buildWhere(args.where)
      parts.push(`WHERE ${w.clauses.join(' AND ')}`)
      params.push(...w.params)
    }

    const results = await sql.query(parts.join(' '), params) as any[]
    return parseInt(results[0]?.count) || 0
  }

  async groupBy(args: {
    by: string[]
    _count?: Record<string, boolean>
    where?: WhereCondition
    orderBy?: Record<string, unknown>
  }): Promise<any[]> {
    const groupCols = args.by.map(col)
    const countField = args._count ? Object.keys(args._count)[0] || 'id' : 'id'

    const parts: string[] = [`SELECT ${groupCols.join(', ')}, COUNT(${col(countField)}) as _count_id FROM ${this.qt}`]
    const params: unknown[] = []
    let paramIdx = 1

    if (args.where && Object.keys(args.where).length > 0) {
      const w = buildWhere(args.where, paramIdx)
      parts.push(`WHERE ${w.clauses.join(' AND ')}`)
      params.push(...w.params)
      paramIdx += w.params.length
    }

    parts.push(`GROUP BY ${groupCols.join(', ')}`)

    if (args.orderBy) {
      const orderByClause = Object.entries(args.orderBy).map(([key, dir]) => {
        if (key === '_count') {
          // Prisma format: { _count: { id: 'desc' } }
          const dirStr = typeof dir === 'string' ? dir : (dir as Record<string, string>)?.id || 'asc'
          return `COUNT(${col(countField)}) ${dirStr}`
        }
        return `${col(key)} ${dir}`
      }).join(', ')
      parts.push(`ORDER BY ${orderByClause}`)
    }

    const results = await sql.query(parts.join(' '), params) as any[]

    // Transform to match Prisma groupBy output format: { byField: value, _count: { field: number } }
    return results.map(row => {
      const result: Record<string, unknown> = {}
      for (const byField of args.by) {
        result[byField] = row[byField]
      }
      result._count = { [countField]: parseInt(row._count_id) || 0 }
      return result
    })
  }

  async upsert(args: {
    where: Record<string, string>
    update: Record<string, unknown>
    create: Record<string, unknown>
  }): Promise<any> {
    const existing = await this.findUnique({ where: args.where })
    if (existing) {
      return this.update({ where: args.where, data: args.update })
    } else {
      return this.create({ data: args.create })
    }
  }
}

// ====== Export db object (Prisma-compatible API) ======

export const db = {
  registration: new Model('Registration'),
  user: new Model('User'),
  setting: new Model('Setting'),
  jalurConfig: new Model('JalurConfig'),
}
