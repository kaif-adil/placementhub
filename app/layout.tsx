import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import ThemeProvider from './components/ThemeProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PlacementHub',
  description: 'Placement experiences for NITW students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body className={`${geist.className} flex flex-col min-h-screen`}>
 <ThemeProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-[#3d3d3d] mt-16 py-8 text-center">
            <p className="text-sm text-gray-400 dark:text-[#8c9bb5]">
              Built for NITW students ·{' '}
              <a
                href="https://github.com/kaif-adil"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition"
              >
                GitHub
              </a>
              {' '}·{' '}
              <a
                href="/feedback"
                className="hover:text-blue-500 transition"
              >
                Feedback
              </a>
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}