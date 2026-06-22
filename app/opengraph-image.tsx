import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PlacementHub — Real placement experiences from NITW students'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 64, fontWeight: 800, color: '#eff1f6' }}>
            Placement
          </span>
          <span style={{ fontSize: 64, fontWeight: 800, color: '#3b82f6' }}>
            Hub
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 28, color: '#8c9bb5', margin: 0, textAlign: 'center' }}>
          Real placement experiences from NITW students
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
          {['Internships', 'Full-Time', 'Interview Rounds', 'Tips'].map(tag => (
            <div
              key={tag}
              style={{
                background: '#282828',
                border: '1px solid #3d3d3d',
                borderRadius: 8,
                padding: '8px 16px',
                color: '#eff1f6',
                fontSize: 18,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* URL */}
        <p style={{ fontSize: 20, color: '#3d3d3d', marginTop: 48 }}>
          placementhub-gamma.vercel.app
        </p>
      </div>
    ),
    { ...size }
  )
}