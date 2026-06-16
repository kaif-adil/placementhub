'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useParams } from 'next/navigation'

export default function ExperiencePage() {
  const params = useParams()
  const supabase = createClient()
  const [exp, setExp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)

  useEffect(() => {
    fetchExperience()
  }, [])

  const fetchExperience = async () => {
    const { data } = await supabase
      .from('experiences')
      .select('*, companies(name, slug)')
      .eq('id', params.id)
      .single()

    if (data) {
      setExp(data)
      setUpvoteCount(data.upvote_count)
    }
    setLoading(false)
  }

  const handleUpvote = async () => {
    if (upvoted) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('Sign in to upvote'); return }

    const { error } = await supabase
      .from('upvotes')
      .insert({ experience_id: params.id, user_id: user.id })

    if (!error) {
      await supabase
        .from('experiences')
        .update({ upvote_count: upvoteCount + 1 })
        .eq('id', params.id)

      setUpvoteCount(c => c + 1)
      setUpvoted(true)
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
      <div className="h-40 bg-gray-200 rounded" />
    </div>
  )

  if (!exp) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-500">Experience not found.</div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      
      <a  href="/search"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition mb-8"
      >
        ← Back to Experiences
      </a>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {exp.companies?.name} — {exp.role}
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
          <span>{exp.placement_year}</span>
          <span>·</span>
          <span>{exp.branch}</span>
          {exp.placement_type && (
            <>
              <span>·</span>
              <span className="capitalize">{exp.placement_type.replace('-', ' ')}</span>
            </>
          )}
          <span>·</span>
          <span className={exp.result === 'selected' ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {exp.result}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            🔒 Anonymous
          </span>
        </div>
      </div>

      <div className="space-y-6 mb-10">
        <h2 className="text-base font-semibold text-gray-900">Interview Rounds</h2>
        {exp.rounds?.map((round: any, i: number) => (
          <div key={i} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Round {i+1}</span>
              <span className="text-sm font-semibold text-gray-800">{round.type}</span>
              {round.platform && <span className="text-xs text-gray-400">· {round.platform}</span>}
              {round.duration_mins && <span className="text-xs text-gray-400">· {round.duration_mins} mins</span>}
            </div>

            {round.questions?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Questions asked:</p>
                <ul className="space-y-1">
                  {round.questions.map((q: string, qi: number) => (
                    <li key={qi} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-blue-400">•</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {round.tips && (
              <p className="text-sm text-gray-600 bg-blue-50 rounded-lg px-3 py-2">
                💡 {round.tips}
              </p>
            )}
          </div>
        ))}
      </div>

      {exp.tips && (
        <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <h2 className="text-sm font-semibold text-amber-800 mb-2">General Tips</h2>
          <p className="text-sm text-amber-900">{exp.tips}</p>
        </div>
      )}

      <button
        onClick={handleUpvote}
        disabled={upvoted}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition
          ${upvoted
            ? 'bg-blue-600 text-white'
            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
      >
        ▲ {upvoted ? 'Upvoted' : 'Helpful'} · {upvoteCount}
      </button>

    </div>
  )
}