'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { useParams } from 'next/navigation'
import ExperienceCard from '../../components/ExperienceCard'

export default function CompanyPage() {
  const params = useParams()
  const supabase = createClient()
  const [company, setCompany] = useState<any>(null)
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanyData()
  }, [])

  const fetchCompanyData = async () => {
    // First fetch the company by slug
    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (!companyData) { setLoading(false); return }
    setCompany(companyData)

    // Then fetch all experiences for this company
    const { data: expData } = await supabase
      .from('experiences')
      .select('*, companies(name, slug)')
      .eq('company_id', companyData.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    setExperiences(expData || [])
    setLoading(false)
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 text-gray-400">Loading...</div>

  if (!company) return <div className="max-w-4xl mx-auto px-4 py-10 text-gray-400">Company not found.</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <a   href="/search"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition mb-8"
      >
        ← Back to Experiences
      </a>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
        <p className="text-gray-500 text-sm">
          {experiences.length} placement experience{experiences.length !== 1 ? 's' : ''} from NITW students
        </p>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No experiences yet for {company.name}.</p>
          <a href="/submit" className="text-blue-500 underline text-sm mt-2 block">
            Be the first to share yours
          </a>
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