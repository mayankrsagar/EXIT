// src/app/page.js
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-indigo-600 mb-4">
        Welcome to Resignation & Exit Portal
      </h1>
      <p className="text-lg mb-8">
        Please login or register to proceed.
      </p>
      <Link href="/login">
        <button className="mx-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Login
        </button>
      </Link>
      <Link href="/register">
        <button className="mx-2 px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">
          Register
        </button>
      </Link>
    </div>
  );
}
