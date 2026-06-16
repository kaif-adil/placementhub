'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from './lib/supabase'

function HomeContent() {
  const searchParams = useSearchParams()
  const [showLoginMessage, setShowLoginMessage] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('login_required') === 'true') {
      setShowLoginMessage(true)
    }
  }, [searchParams])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">

      {showLoginMessage && (
        <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span>Please sign in to share your experience.</span>
          <button
            onClick={handleSignIn}
            className="text-sm font-medium bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition"
          >
            Sign in with Google
          </button>
        </div>
      )}

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Placement<span className="text-blue-600">Hub</span>
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Real placement experiences from NITW students.
        <br />
        Search by company, role, and year.
      </p>
      <div className="flex items-center justify-center gap-4">
        <a href="/search" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Browse Experiences
        </a>
        <a href="/submit" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
          Share Yours
        </a>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}