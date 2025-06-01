'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    // const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (token) {
      setIsAuthenticated(true);
      // setUserName(userData.name || '');
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    // localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserName('');
    // Optionally redirect to home after sign out
    window.location.href = '/';
  };

  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-indigo-600 mb-4">
        Welcome to Resignation & Exit Portal
      </h1>
      
      {isAuthenticated ? (
        <div>
          <p className="text-lg mb-4">
            Welcome back 
            {/* <span className="font-semibold">{userName}</span>! */}
          </p>
          <div className="flex justify-center gap-4">
            {/* <Link href="/dashboard">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Go to Dashboard
              </button>
            </Link> */}
            <button 
              onClick={handleSignOut}
              className="px-6 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-lg mb-8">
            Please login or register to proceed.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">
                Register
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}