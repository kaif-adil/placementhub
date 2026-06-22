'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from './lib/supabase'

function HomeContent() {
  const searchParams = useSearchParams()
  const [showLoginMessage, setShowLoginMessage] = useState(false)
  const [stats, setStats] = useState({ experiences: 0, companies: 0 })
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('login_required') === 'true') {
      setShowLoginMessage(true)
    }
    fetchStats()
  }, [searchParams])

  const fetchStats = async () => {
    const { count: expCount } = await supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    const { count: compCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })

    setStats({
      experiences: expCount || 0,
      companies: compCount || 0,
    })
  }

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
        <div className="mb-8 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm px-4 py-3 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span>Please sign in to share your experience.</span>
          <button
            onClick={handleSignIn}
            className="text-sm font-medium bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition"
          >
            Sign in with Google
          </button>
        </div>
      )}

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Placement<span className="text-blue-600">Hub</span>
      </h1>
      <p className="text-lg text-gray-500 dark:text-[#8c9bb5] mb-8">
        Real placement experiences from NITW students.
        <br />
        Search by company, role, and year.
      </p>

      {/* Stats */}
      {stats.experiences > 0 && (
        <div className="flex items-center justify-center gap-8 mb-10">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.experiences}</p>
            <p className="text-sm text-gray-500 dark:text-[#8c9bb5] mt-1">Experiences</p>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-[#3d3d3d]" />
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.companies}</p>
            <p className="text-sm text-gray-500 dark:text-[#8c9bb5] mt-1">Companies</p>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-[#3d3d3d]" />
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">NITW</p>
            <p className="text-sm text-gray-500 dark:text-[#8c9bb5] mt-1">Students Only</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <a href="/search" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Browse Experiences
        </a>
        <a href="/submit" className="px-6 py-3 border border-gray-300 dark:border-[#3d3d3d] text-gray-700 dark:text-[#eff1f6] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#282828] transition">
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