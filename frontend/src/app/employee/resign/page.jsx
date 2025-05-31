// src/app/employee/resign/page.js
"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/config/apiUrl';

export default function ResignPage() {
  const [intendedLastWorkingDay , setIntendedLastWorkingDay ] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Ensure user is logged in and role is EMPLOYEE
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "EMPLOYEE") {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}user/resign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ intendedLastWorkingDay , reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || data.message || "Submission failed");
      } else {
        setMessage("Resignation submitted successfully!");
        setIntendedLastWorkingDay("");
        setReason("");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Submit Resignation</h2>
      {message && (
        <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">
          {message}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="intendedLastWorkingDay " className="block text-sm font-medium">
            Last Working Day
          </label>
          <input
            id="intendedLastWorkingDay "
            type="date"
            value={intendedLastWorkingDay }
            onChange={(e) => setIntendedLastWorkingDay(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium">
            Reason for Resignation
          </label>
          <textarea
            id="reason"
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
