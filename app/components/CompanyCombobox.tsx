'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '../lib/supabase'

type Company = {
  id: string
  name: string
  slug: string
  type: string
}

type Props = {
  onSelect: (id: string) => void
}

export default function CompanyCombobox({ onSelect }: Props) {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selected, setSelected] = useState<Company | null>(null)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Search companies as user types
  useEffect(() => {
    if (query.length < 1) { setCompanies([]); return }

    const search = async () => {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(6)
      setCompanies(data || [])
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (company: Company) => {
    setSelected(company)
    setQuery(company.name)
    setOpen(false)
    onSelect(company.id)
  }

  const handleCreate = async () => {
    if (!query.trim()) return
    setCreating(true)

    const slug = query.trim().toLowerCase().replace(/\s+/g, '-')

    const { data, error } = await supabase
      .from('companies')
      .insert({ name: query.trim(), slug, type: 'product' })
      .select()
      .single()

    if (!error && data) {
      handleSelect(data)
    }

    setCreating(false)
  }

  const showCreateOption = query.length > 1 &&
    !companies.find(c => c.name.toLowerCase() === query.toLowerCase())

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        placeholder="Search or add company..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-400 mt-1">
        Type to search. If your company doesn't appear, type the name and click "+ Add".
      </p>

      {open && (query.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">

          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleSelect(company)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between"
            >
              <span>{company.name}</span>
              <span className="text-xs text-gray-400">{company.type}</span>
            </button>
          ))}

          {showCreateOption && (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-t border-gray-100"
            >
              <span>+</span>
              <span>{creating ? 'Adding...' : `Add "${query}"`}</span>
            </button>
          )}

          {companies.length === 0 && !showCreateOption && (
            <div className="px-4 py-3 text-sm text-gray-400">
              Type to search companies
            </div>
          )}
        </div>
      )}
    </div>
  )
}