import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4">
        <Link href="/generate" className="rounded-lg bg-gray-900 px-6 py-3 text-center text-white font-medium shadow-sm hover:bg-gray-800 transition-colors">Generate pins</Link>
        <Link href="/validate" className="rounded-lg bg-gray-900 px-6 py-3 text-center text-white font-medium shadow-sm hover:bg-gray-800 transition-colors">Validate your pin</Link>
      </div>
    </div>
  )
}
