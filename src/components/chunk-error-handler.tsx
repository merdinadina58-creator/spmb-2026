'use client'

import { useEffect } from 'react'

/**
 * Handles chunk loading errors that occur when the dev server restarts.
 * Only reloads ONCE per session to prevent infinite reload loops.
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    const RELOAD_KEY = 'spmb_chunk_reloaded'

    const handleChunkError = (event: ErrorEvent) => {
      const msg = event.message || ''
      const isChunkError =
        msg.includes('Loading chunk') ||
        msg.includes('ChunkLoadError') ||
        msg.includes('loading script')

      if (isChunkError && !sessionStorage.getItem(RELOAD_KEY)) {
        console.warn('Chunk load error detected, reloading page once...', msg)
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
      }
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason || '')
      const isChunkError =
        reason.includes('Loading chunk') ||
        reason.includes('ChunkLoadError')

      if (isChunkError && !sessionStorage.getItem(RELOAD_KEY)) {
        console.warn('Chunk load rejection detected, reloading page once...', reason)
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
      }
    }

    // Clear the reload flag on successful load
    sessionStorage.removeItem(RELOAD_KEY)

    window.addEventListener('error', handleChunkError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleChunkError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
