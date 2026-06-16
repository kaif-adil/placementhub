'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchMyExperiences()
  }, [])

  const fetchMyExperiences = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    setUser(user)

    const { data } = await supabase
      .from('experiences')
      .select('*, companies(name, slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setExperiences(data || [])
    setLoading(false)
  }

  const handleDelete = async (exp: any) => {
    const confirmed = window.confirm(
      'Delete this experience? A draft with this data will be saved so you can resubmit easily if needed.'
    )
    if (!confirmed) return

    setDeleting(exp.id)

    // Save a draft before deleting, so resubmitting is easy
    localStorage.setItem('ph_draft', JSON.stringify({
      companyId: exp.company_id,
      companyName: exp.companies?.name || '',
      role: exp.role,
      placementYear: exp.placement_year,
      branch: exp.branch,
      result: exp.result,
      placementType: exp.placement_type,
      rounds: exp.rounds,
      tips: exp.tips,
    }))

    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', exp.id)

    if (!error) {
      setExperiences(prev => prev.filter(e => e.id !== exp.id))
    }

    setDeleting(null)
  }

  const resultColor: Record<string, string> = {
    selected:   'bg-green-100 text-green-700',
    rejected:   'bg-red-100 text-red-600',
    waitlisted: 'bg-amber-100 text-amber-700',
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-400">
      Loading your experiences...
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          My Experiences
        </h1>
        <p className="text-sm text-gray-500">
          {user?.user_metadata?.full_name || user?.email} ·{' '}
          {experiences.length} experience{experiences.length !== 1 ? 's' : ''} submitted
        </p>
      </div>

      {/* Empty state */}
      {experiences.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl">
          <p className="text-gray-400 mb-3">You haven't submitted any experiences yet.</p>
          
           <a href="/submit"
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Share your first experience
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="border border-gray-200 rounded-xl p-5 bg-white"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {exp.companies?.name} — {exp.role}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">{exp.placement_year}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{exp.branch}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {exp.rounds?.length || 0} rounds
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      ▲ {exp.upvote_count}
                    </span>
                  </div>
                </div>

                {/* Result badge */}
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0
                  ${resultColor[exp.result] || 'bg-gray-100 text-gray-600'}`}>
                  {exp.result}
                </span>
              </div>

              {/* Tips preview */}
              {exp.tips && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {exp.tips}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                
                <a  href={`/experiences/${exp.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(exp)}
                  disabled={deleting === exp.id}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-40 transition"
                >
                  {deleting === exp.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit another */}
      {experiences.length > 0 && (
        <div className="mt-8 text-center">
          
          <a  href="/submit"
            className="text-sm text-blue-600 hover:underline"
          >
            + Submit another experience
          </a>
        </div>
      )}

    </div>
  )
}