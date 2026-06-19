'use client'

import type { Round } from '../lib/types'

type Props = {
  rounds: Round[]
  onChange: (rounds: Round[]) => void
}

const ROUND_TYPES = ['Resume Shortlisting', 'OA', 'Technical', 'HR', 'Group Discussion', 'Managerial']

export default function RoundsBuilder({ rounds, onChange }: Props) {

  const addRound = () => {
    onChange([...rounds, { type: 'Technical', questions: [''], tips: '' }])
  }

  const removeRound = (index: number) => {
    onChange(rounds.filter((_, i) => i !== index))
  }

  const updateRound = (index: number, field: keyof Round, value: any) => {
    const updated = [...rounds]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const addQuestion = (roundIndex: number) => {
    const updated = [...rounds]
    updated[roundIndex].questions.push('')
    onChange(updated)
  }

  const updateQuestion = (roundIndex: number, qIndex: number, value: string) => {
    const updated = [...rounds]
    updated[roundIndex].questions[qIndex] = value
    onChange(updated)
  }

  const removeQuestion = (roundIndex: number, qIndex: number) => {
    const updated = [...rounds]
    updated[roundIndex].questions = updated[roundIndex].questions.filter((_, i) => i !== qIndex)
    onChange(updated)
  }

  const inputClass = "border border-gray-300 dark:border-[#3d3d3d] bg-white dark:bg-[#282828] text-gray-900 dark:text-[#eff1f6] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-xs font-medium text-gray-600 dark:text-[#8c9bb5] mb-1"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Interview Rounds</h2>
        <button
          onClick={addRound}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Round
        </button>
      </div>

      {rounds.map((round, rIndex) => (
        <div key={rIndex} className="border border-gray-200 dark:border-[#3d3d3d] rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-[#282828]">

          {/* Round header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-[#8c9bb5] uppercase tracking-wide">
                Round {rIndex + 1}
              </span>
              <select
                value={round.type}
                onChange={(e) => updateRound(rIndex, 'type', e.target.value)}
                className="border border-gray-300 dark:border-[#3d3d3d] bg-white dark:bg-[#282828] text-gray-900 dark:text-[#eff1f6] rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROUND_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {rounds.length > 1 && (
              <button
                onClick={() => removeRound(rIndex)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>

          {/* Platform (OA only) */}
          {round.type === 'OA' && (
            <div>
              <label className={labelClass}>Platform</label>
              <input
                type="text"
                placeholder="e.g. HackerRank, CodeSignal, HackerEarth"
                value={round.platform || ''}
                onChange={(e) => updateRound(rIndex, 'platform', e.target.value)}
                className={`w-full ${inputClass}`}
              />
            </div>
          )}

          {/* Duration — hidden for Resume Shortlisting */}
          {round.type !== 'Resume Shortlisting' && (
            <div>
              <label className={labelClass}>Duration (minutes)</label>
              <input
                type="number"
                placeholder="e.g. 90"
                value={round.duration_mins || ''}
                onChange={(e) => updateRound(rIndex, 'duration_mins', Number(e.target.value))}
                className={`w-32 ${inputClass}`}
              />
            </div>
          )}

          {/* Questions — hidden for Resume Shortlisting */}
          {round.type !== 'Resume Shortlisting' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600 dark:text-[#8c9bb5]">Types of Questions Asked</label>
                <button
                  onClick={() => addQuestion(rIndex)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {round.questions.map((q, qIndex) => (
                  <div key={qIndex} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Question ${qIndex + 1}`}
                      value={q}
                      onChange={(e) => updateQuestion(rIndex, qIndex, e.target.value)}
                      className={`flex-1 ${inputClass}`}
                    />
                    {round.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(rIndex, qIndex)}
                        className="text-gray-400 hover:text-red-500 text-lg leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips — hidden for Resume Shortlisting */}
          {round.type !== 'Resume Shortlisting' && (
            <div>
              <label className={labelClass}>Tips for this round</label>
              <textarea
                rows={2}
                placeholder="What would you tell someone about this specific round?"
                value={round.tips}
                onChange={(e) => updateRound(rIndex, 'tips', e.target.value)}
                className={`w-full ${inputClass}`}
              />
            </div>
          )}

        </div>
      ))}
    </div>
  )
}