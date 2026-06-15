'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'
import ExperienceCard from '../components/ExperienceCard'

export default function SearchPage() {
  const supabase = createClient()

  // State for experiences list and filters
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [branch, setBranch] = useState('')
  const [result, setResult] = useState('')

  // Fetch experiences whenever filters change
  useEffect(() => {
    fetchExperiences()
  }, [search, year, branch, result])

const fetchExperiences = async () => {
  setLoading(true)

  // If search looks like a company name, find matching company IDs first
  let companyIds: string[] = []
  if (search.trim()) {
    const { data: matchingCompanies } = await supabase
      .from('companies')
      .select('id')
      .ilike('name', `%${search.trim()}%`)

    if (matchingCompanies && matchingCompanies.length > 0) {
      companyIds = matchingCompanies.map(c => c.id)
    }
  }

  // Build the main query
  let query = supabase
    .from('experiences')
    .select('*, companies(name, slug)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Apply filters
  if (year)   query = query.eq('placement_year', parseInt(year))
  if (branch) query = query.eq('branch', branch)
  if (result) query = query.eq('result', result)

  // Search logic
  if (search.trim()) {
    if (companyIds.length > 0) {
      // Found matching companies — filter by those company IDs
      query = query.in('company_id', companyIds)
    } else {
    // No company match — fall back to ilike on role field for partial matching
    query = query.ilike('role', `%${search.trim()}%`)
    }
  }

  const { data } = await query.limit(50)
  setExperiences(data || [])
  setLoading(false)
}

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Browse Experiences
      </h1>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 mb-8">

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by company, role, or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Filter dropdowns */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            {[2026, 2025, 2024, 2023, 2022].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Branches</option>
            {['CSE', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'MME', 'BT', 'MNC'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Results</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {loading ? 'Loading...' : `${experiences.length} experiences found`}
      </p>

      {/* Experience cards grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No experiences found</p>
          <p className="text-sm mt-1">Try different filters or <a href="/submit" className="text-blue-500 underline">add one</a></p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {experiences.map(exp => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      )}

    </div>
  )
}