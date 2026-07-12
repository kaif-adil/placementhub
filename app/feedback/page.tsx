'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'

export default function FeedbackPage() {
  const supabase = createClient()
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!message.trim()) return
    setSubmitting(true)
    setError('')

    const { error } = await supabase
      .from('feedback')
      .insert({ message: message.trim() })

    if (error) {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
      return
    }

    setDone(true)
    setSubmitting(false)
  }

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thanks for the feedback</h1>
      <p className="text-sm text-gray-500 dark:text-[#8c9bb5]">It genuinely helps make the platform better.</p>
      <a href="/" className="mt-6 inline-block text-sm text-blue-500 hover:underline">Back to homepage</a>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share Feedback</h1>
      <p className="text-sm text-gray-500 dark:text-[#8c9bb5] mb-8">
        Anonymous. Anything helps like bugs, suggestions, or general thoughts.
      </p>

      <textarea
        rows={6}
        placeholder="What's on your mind..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 dark:border-[#3d3d3d] bg-white dark:bg-[#282828] text-gray-900 dark:text-[#eff1f6] placeholder-gray-400 dark:placeholder-[#8c9bb5] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      {error && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !message.trim()}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  )
}