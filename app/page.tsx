export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Placement<span className="text-blue-600">Hub</span>
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Real placement experiences from NITW students.
        <br />
        Search by company, role, and year.
      </p>
      <div className="flex items-center justify-center gap-4">
        <a href="/search" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Browse Experiences
        </a>
        <a href="/submit" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
          Share Yours
        </a>
      </div>
    </main>
  )
}