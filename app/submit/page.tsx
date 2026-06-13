'use client'

import { useState } from 'react'
import CompanyCombobox from '../components/CompanyCombobox'
import RoundsBuilder from '../components/RoundsBuilder'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import type { Round } from '../lib/types'

export default function SubmitPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [companyId, setCompanyId] = useState('')
  const [role, setRole] = useState('')
  const [placementYear, setPlacementYear] = useState(new Date().getFullYear())
  const [branch, setBranch] = useState('')
  const [result, setResult] = useState('')
  const [rounds, setRounds] = useState<Round[]>([
    { type: 'OA', questions: [''], tips: '' }
  ])
  const [tips, setTips] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be signed in to submit.')
      setSubmitting(false)
      return
    }

    await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
    }, { onConflict: 'id' })

    const { error: insertError } = await supabase.from('experiences').insert({
      company_id: companyId,
      user_id: user.id,
      role,
      placement_year: placementYear,
      branch,
      result,
      rounds,
      tips,
      status: 'published',
    })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    localStorage.removeItem('ph_draft')
    router.push('/')
  }

  const saveDraft = () => {
    localStorage.setItem('ph_draft', JSON.stringify({
      companyId, role, placementYear, branch, result, rounds, tips
    }))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h1>
      <p className="text-gray-500 mb-8">Help your juniors prepare better. Takes 5 minutes.</p>

      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
              ${step === s ? 'bg-blue-600 text-white' :
                step > s ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-500'}`}>
              {step > s ? '✓' : s}
            </div>
            <span className={`text-sm ${step === s ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              {s === 1 ? 'Company & Role' : s === 2 ? 'Interview Rounds' : 'Final Tips'}
            </span>
            {s < 3 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <CompanyCombobox onSelect={(id) => setCompanyId(id)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <input
              type="text"
              placeholder="e.g. SDE Intern, SDE-1, Data Analyst"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <select
                value={placementYear}
                onChange={(e) => setPlacementYear(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2026, 2025, 2024, 2023, 2022].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select branch</option>
                {['CSE', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'MME', 'BT', 'MNC', 'IT'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Result *</label>
            <div className="flex gap-3">
              {['selected', 'rejected', 'waitlisted'].map((r) => (
                <button
                  key={r}
                  onClick={() => setResult(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                    ${result === r
                      ? r === 'selected' ? 'bg-green-600 text-white border-green-600'
                        : r === 'rejected' ? 'bg-red-500 text-white border-red-500'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={saveDraft} className="text-sm text-gray-500 hover:text-gray-700">
              Save draft
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!companyId || !role || !branch || !result}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <RoundsBuilder rounds={rounds} onChange={setRounds} />
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={rounds.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">General Tips & Advice</label>
            <textarea
              rows={6}
              placeholder="What would you tell someone preparing for this company?"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Preview</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Role:</span> {role}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Year:</span> {placementYear}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Branch:</span> {branch}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Result:</span> {result}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Rounds:</span> {rounds.length}</p>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(2)} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-40 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Experience ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}