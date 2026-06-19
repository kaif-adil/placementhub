'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    setIsDark(saved === 'dark')

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

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
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
    setMenuOpen(false)
  }

  const initial = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || '?'

  return (
    <nav className="w-full border-b border-gray-200 dark:border-[#3d3d3d] bg-white dark:bg-[#1a1a1a] px-4 py-3 relative z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="text-xl font-bold text-gray-900 dark:text-white flex-shrink-0">
          Placement<span className="text-blue-600">Hub</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="/search"
            className="text-sm text-gray-600 dark:text-[#eff1f6] hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#282828] transition"
          >
            Browse
          </a>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#282828] transition text-gray-600 dark:text-[#eff1f6]"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <a
                href="/submit"
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
              >
                + Submit Experience
              </a>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center hover:bg-blue-700 transition"
                >
                  {initial}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3d3d3d] rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-[#3d3d3d]">
                      <p className="text-xs text-gray-400 dark:text-[#8c9bb5]">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-[#eff1f6] truncate">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                    </div>
                    <a
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 dark:text-[#eff1f6] hover:bg-gray-50 dark:hover:bg-[#282828]"
                    >
                      My Experiences
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
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
          <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 dark:border-[#3d3d3d] mt-3 pt-3 pb-2 flex flex-col gap-1">
          <a
            href="/search"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2.5 text-sm text-gray-700 dark:text-[#eff1f6] hover:bg-gray-50 dark:hover:bg-[#282828] rounded-lg"
          >
            Browse Experiences
          </a>
          <button
            onClick={toggleTheme}
            className="px-4 py-2.5 text-sm text-gray-700 dark:text-[#eff1f6] hover:bg-gray-50 dark:hover:bg-[#282828] rounded-lg text-left flex items-center gap-2"
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          {user ? (
            <>
              <a
                href="/submit"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 text-sm text-gray-700 dark:text-[#eff1f6] hover:bg-gray-50 dark:hover:bg-[#282828] rounded-lg"
              >
                + Submit Experience
              </a>
              <a
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 text-sm text-gray-700 dark:text-[#eff1f6] hover:bg-gray-50 dark:hover:bg-[#282828] rounded-lg"
              >
                My Experiences
              </a>
              <div className="px-4 py-2 border-t border-gray-100 dark:border-[#3d3d3d] mt-1">
                <p className="text-xs text-gray-400 dark:text-[#8c9bb5] mb-1">Signed in as</p>
                <p className="text-sm text-gray-700 dark:text-[#eff1f6] truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg text-left"
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