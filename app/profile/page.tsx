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

  const internshipColors: Record<string, string> = {
    ppo_offered: 'bg-green-100 text-green-700',
    no_ppo:      'bg-red-100 text-red-600',
    pursuing:    'bg-amber-100 text-amber-700',
  }

  const placementColors: Record<string, string> = {
    selected:   'bg-green-100 text-green-700',
    rejected:   'bg-red-100 text-red-600',
    waitlisted: 'bg-amber-100 text-amber-700',
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-400 dark:text-[#8c9bb5]">
      Loading your experiences...
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          My Experiences
        </h1>
        <p className="text-sm text-gray-500 dark:text-[#8c9bb5]">
          {user?.user_metadata?.full_name || user?.email} ·{' '}
          {experiences.length} experience{experiences.length !== 1 ? 's' : ''} submitted
        </p>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-[#3d3d3d] rounded-xl">
          <p className="text-gray-400 dark:text-[#8c9bb5] mb-3">You haven't submitted any experiences yet.</p>
          <a
            href="/submit"
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
              className="border border-gray-200 dark:border-[#3d3d3d] rounded-xl p-5 bg-white dark:bg-[#282828]"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {exp.companies?.name} — {exp.role}
                    </h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      exp.experience_type === 'internship'
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {exp.experience_type === 'internship' ? 'Internship' : 'Full-Time'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400 dark:text-[#8c9bb5]">{exp.placement_year}</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-xs text-gray-400 dark:text-[#8c9bb5]">{exp.branch}</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-xs text-gray-400 dark:text-[#8c9bb5]">
                      {exp.rounds?.length || 0} rounds
                    </span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-xs text-gray-400 dark:text-[#8c9bb5]">
                      ▲ {exp.upvote_count}
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                  exp.experience_type === 'internship'
                    ? internshipColors[exp.internship_outcome] || 'bg-gray-100 text-gray-600'
                    : placementColors[exp.result] || 'bg-gray-100 text-gray-600'
                }`}>
                  {exp.experience_type === 'internship'
                    ? (exp.internship_outcome === 'ppo_offered' ? 'PPO Offered' : exp.internship_outcome === 'no_ppo' ? 'No PPO' : 'Pursuing')
                    : (exp.result === 'rejected' ? 'Not Selected' : exp.result)}
                </span>
              </div>

              {exp.tips && (
                <p className="text-sm text-gray-500 dark:text-[#8c9bb5] mb-4 line-clamp-2">
                  {exp.tips}
                </p>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-[#3d3d3d]">
                <a
                  href={`/experiences/${exp.id}`}
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

      {experiences.length > 0 && (
        <div className="mt-8 text-center">
          <a href="/submit" className="text-sm text-blue-600 hover:underline">
            + Submit another experience
          </a>
        </div>
      )}

    </div>
  )
}