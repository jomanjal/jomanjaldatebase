import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/error-boundary'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'GameCoach.AI',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function calculateScrollbarWidth() {
                  var outer = document.createElement('div');
                  outer.style.visibility = 'hidden';
                  outer.style.overflow = 'scroll';
                  outer.style.msOverflowStyle = 'scrollbar';
                  document.body.appendChild(outer);
                  
                  var inner = document.createElement('div');
                  outer.appendChild(inner);
                  
                  var scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
                  
                  outer.parentNode.removeChild(outer);
                  
                  document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', calculateScrollbarWidth);
                } else {
                  calculateScrollbarWidth();
                }
                
                window.addEventListener('resize', calculateScrollbarWidth);
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
