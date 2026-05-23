import { db } from '@/lib/db'

/**
 * Clean up expired sessions from the database.
 * Should be called periodically to prevent orphaned sessions from accumulating.
 * Sessions older than 7 days are considered expired.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    // Find all session keys
    const sessions = await db.setting.findMany({
      where: { key: { startsWith: 'session:' } },
      select: { key: true, value: true },
    })

    let deleted = 0
    for (const session of sessions) {
      try {
        const data = JSON.parse(session.value)
        // Delete if session is older than 7 days or has no createdAt
        if (!data.createdAt || new Date(data.createdAt) < new Date(sevenDaysAgo)) {
          await db.setting.delete({ where: { key: session.key } })
          deleted++
        }
      } catch {
        // Corrupt session data — delete it
        await db.setting.delete({ where: { key: session.key } })
        deleted++
      }
    }

    return deleted
  } catch {
    return 0
  }
}
