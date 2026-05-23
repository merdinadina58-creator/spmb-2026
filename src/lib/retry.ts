/**
 * Retry helper for Neon DB connection timeouts
 * Automatically retries on ETIMEDOUT, fetch failed, timeout, and NeonDbError
 * Uses exponential backoff between retries
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  initialDelayMs = 1000
): Promise<T> {
  let delayMs = initialDelayMs
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      const isRetryable = error instanceof Error && (
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('fetch failed') ||
        error.message?.includes('timeout') ||
        error.message?.includes('AbortError') ||
        error.message?.includes('NeonDbError')
      )
      if (isRetryable && attempt < retries) {
        console.warn(`DB query failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delayMs}ms...`, error.message)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        delayMs *= 2 // exponential backoff
        continue
      }
      throw error
    }
  }
  throw new Error('Unreachable')
}
