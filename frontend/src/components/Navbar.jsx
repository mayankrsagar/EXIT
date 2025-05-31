"use client";
import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

function Navbar() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // "EMPLOYEE" or "HR"
  const router = useRouter();

  useEffect(() => {
    // On mount, read from localStorage
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    if (t) {
      setToken(t);
      setRole(r);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-bold text-indigo-600 hover:text-indigo-800">
            ResignExit
          </span>
        </Link>
        <div className="space-x-4">
          {!token ? (
            <>
              <Link href="/login">
                <button className="px-4 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-1 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                  Register
                </button>
              </Link>
            </>
          ) : role === "EMPLOYEE" ? (
            <>
              <Link href="/employee/resign">
                <button className="px-4 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                  Resign
                </button>
              </Link>
              <Link href="/employee/exit_interview">
                <button className="px-4 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                  Exit Interview
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : role === "HR" ? (
            <>
              <Link href="/admin/resignations">
                <button className="px-4 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                  All Resignations
                </button>
              </Link>
              <Link href="/admin/exit_interviews">
                <button className="px-4 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                  Exit Interviews
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;