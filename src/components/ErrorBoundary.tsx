'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h1>
            <p className="text-emerald-200/70 text-sm mb-1">
              Aplikasi mengalami error yang tidak terduga.
            </p>
            <p className="text-red-300/60 text-xs mb-6 max-w-sm mx-auto">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Coba Lagi
              </Button>
              <Button
                onClick={this.handleReload}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Muat Ulang
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
