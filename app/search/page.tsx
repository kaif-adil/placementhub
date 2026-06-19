'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'
import ExperienceCard from '../components/ExperienceCard'

export default function SearchPage() {
  const supabase = createClient()

  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [branch, setBranch] = useState('')
  const [result, setResult] = useState('')
  const [experienceType, setExperienceType] = useState('')

  useEffect(() => {
    fetchExperiences()
  }, [search, year, branch, result, experienceType])

  const fetchExperiences = async () => {
    setLoading(true)

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

    let query = supabase
      .from('experiences')
      .select('*, companies(name, slug)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (year)   query = query.eq('placement_year', parseInt(year))
    if (branch) query = query.eq('branch', branch)
    if (result) query = query.eq('result', result)
    if (experienceType) query = query.eq('experience_type', experienceType)

    if (search.trim()) {
      if (companyIds.length > 0) {
        query = query.in('company_id', companyIds)
      } else {
        query = query.ilike('role', `%${search.trim()}%`)
      }
    }

    const { data } = await query.limit(50)
    setExperiences(data || [])
    setLoading(false)
  }

  const selectClass = "border border-gray-300 dark:border-[#3d3d3d] bg-white dark:bg-[#282828] text-gray-700 dark:text-[#eff1f6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Browse Experiences
      </h1>

      <div className="flex flex-col gap-3 mb-8">
        <input
          type="text"
          placeholder="Search by company, role, or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 dark:border-[#3d3d3d] bg-white dark:bg-[#282828] text-gray-900 dark:text-[#eff1f6] placeholder-gray-400 dark:placeholder-[#8c9bb5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-3 flex-wrap">
          <select value={experienceType} onChange={(e) => setExperienceType(e.target.value)} className={selectClass}>
            <option value="">Internship + Full-Time</option>
            <option value="internship">Internship Only</option>
            <option value="fulltime">Full-Time Only</option>
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} className={selectClass}>
            <option value="">All Years</option>
            {[2026, 2025, 2024, 2023, 2022].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select value={branch} onChange={(e) => setBranch(e.target.value)} className={selectClass}>
            <option value="">All Branches</option>
            {['CSE', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'MME', 'BT', 'MNC'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select value={result} onChange={(e) => setResult(e.target.value)} className={selectClass}>
            <option value="">All Results</option>
            <option value="selected">Selected</option>
            <option value="rejected">Not Selected</option>
            <option value="waitlisted">Waitlisted</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-[#8c9bb5] mb-4">
        {loading ? 'Loading...' : `${experiences.length} experiences found`}
      </p>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-36 bg-gray-100 dark:bg-[#282828] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-[#8c9bb5]">
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