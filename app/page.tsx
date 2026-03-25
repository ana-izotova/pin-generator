import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <Link href="/pin-generator">Generate pins</Link>
      <Link href="/pin-validator">Validate your pin</Link>
    </div>
  )
}
