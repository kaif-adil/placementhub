'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
    setDropdownOpen(false)
    setMenuOpen(false)
  }

  // Get first initial for avatar
  const initial = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || '?'

  return (
    <nav className="w-full border-b border-gray-200 bg-white px-4 py-3 relative z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="text-xl font-bold text-gray-900 flex-shrink-0">
          Placement<span className="text-blue-600">Hub</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          
          <a  href="/search"
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Browse
          </a>

          {user ? (
            <>
              
              <a  href="/submit"
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
              >
                + Submit Experience
              </a>

              {/* Avatar dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center hover:bg-blue-700 transition"
                >
                  {initial}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                    </div>
                    
                    <a  href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Experiences
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
            >
              Sign in with Google
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 mt-3 pt-3 pb-2 flex flex-col gap-1">
          
          <a  href="/search"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Browse Experiences
          </a>

          {user ? (
            <>
              
              <a  href="/submit"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                + Submit Experience
              </a>
              
              <a  href="/profile"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                My Experiences
              </a>
              <div className="px-4 py-2 border-t border-gray-100 mt-1">
                <p className="text-xs text-gray-400 mb-1">Signed in as</p>
                <p className="text-sm text-gray-700 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg text-left"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="mx-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </nav>
  )
}