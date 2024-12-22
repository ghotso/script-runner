import Link from 'next/link'

export default function Sidebar() {
  return (
    <nav className="w-64 bg-gray-800 p-4">
      <h1 className="text-2xl font-bold mb-4">Script Runner</h1>
      <ul>
        <li>
          <Link href="/" className="block py-2 hover:text-blue-400">
            Home
          </Link>
        </li>
        <li>
          <Link href="/add-script" className="block py-2 hover:text-blue-400">
            Add New Script
          </Link>
        </li>
      </ul>
    </nav>
  )
}

