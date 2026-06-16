'use client'

// What this file does:
// Shows a summary card for one experience.
// Used on the search page and company page.
// Clicking it goes to the full experience detail page.

type Props = {
  experience: {
    id: string
    role: string
    placement_year: number
    branch: string
    result: string
    placement_type?: string
    upvote_count: number
    tips: string
    rounds: any[]
    companies: { name: string; slug: string }
  }
}

export default function ExperienceCard({ experience }: Props) {

  // Result badge color — green for selected, red for rejected, amber for waitlisted
  const resultColor = {
    selected:   'bg-green-100 text-green-700',
    rejected:   'bg-red-100 text-red-600',
    waitlisted: 'bg-amber-100 text-amber-700',
  }[experience.result] || 'bg-gray-100 text-gray-600'

  return (
    <a
      href={`/experiences/${experience.id}`}
      className="block border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition bg-white"
    >
      {/* Top row: company name + result badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-900 text-base">
          {experience.companies?.name}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${resultColor}`}>
          {experience.result === 'rejected' ? 'Not Selected' : experience.result}
        </span>
      </div>

      {/* Role */}
      <p className="text-sm text-gray-700 font-medium mb-3">{experience.role}</p>

      {/* Meta info row */}
      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
        <span>{experience.placement_year}</span>
        <span>·</span>
        <span>{experience.branch}</span>
        {experience.placement_type && (
          <>
            <span>·</span>
            <span className="capitalize">{experience.placement_type.replace('-', ' ')}</span>
          </>
        )}
        <span>·</span>
        <span>{experience.rounds?.length || 0} rounds</span>
        <span>·</span>
        <span>▲ {experience.upvote_count}</span>
      </div>

      {/* Tips preview */}
      {experience.tips && (
        <p className="mt-3 text-xs text-gray-500 line-clamp-2">
          {experience.tips}
        </p>
      )}
    </a>
  )
}