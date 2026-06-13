'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get current user on page load
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <nav className="w-full border-b border-gray-200 bg-white px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="text-xl font-bold text-gray-900">
          Placement<span className="text-blue-600">Hub</span>
        </a>

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-black px-4 py-2 rounded-lg border border-black bg-green-500 hover:bg-green-600 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Sign in with Google
            </button>
          )}
        </div>

      </div>
    </nav>
  )
}