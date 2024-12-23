export default function TestPage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-blue-500 mb-4">Test Page</h1>
      <p className="text-lg text-gray-200 mb-4">This is a test paragraph with Tailwind classes.</p>
      <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
      <div className="mt-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
        <p className="text-white">This should have a glassmorphism effect.</p>
      </div>
    </div>
  )
}

