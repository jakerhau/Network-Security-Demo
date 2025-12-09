'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LogoutButton = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error((await response.json()).error ?? 'Đăng xuất thất bại')
      }
      router.push('/')
      router.refresh()
    } catch (err) {
      const logoutError = err instanceof Error ? err : new Error('Đăng xuất thất bại')
      setError(logoutError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Đang đăng xuất...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Đăng xuất</span>
          </>
        )}
      </button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}

export default LogoutButton

