import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative">
      <header className="sticky top-0 z-40 bg-background/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            <Image
              src="/buildlog-logo.png"
              alt="BuildLog Site Diaries"
              width={180}
              height={66}
              className="h-auto w-auto max-w-[400px] object-contain"
              quality={90}
              priority
            />
          </Link>
        </div>
      </header>

      <main className="container mx-auto pl-6 md:pl-8 pr-4 pt-6 md:pt-8 pb-24">
        {children}
      </main>

      <Link href="/diary/new" className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="h-14 w-14 rounded-2xl shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-transform motion-reduce:transition-none hover:scale-105 motion-reduce:hover:scale-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Create new diary entry"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Create diary entry</span>
        </Button>
      </Link>
    </div>
  )
}