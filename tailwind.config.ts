import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lc: {
          bg:      '#0a0a0a',
          surface: '#1a1a1a',
          card:    '#282828',
          border:  '#3d3d3d',
          text:    '#eff1f6',
          muted:   '#8c9bb5',
          orange:  '#ffa116',
        }
      }
    },
  },
  plugins: [],
}

export default config