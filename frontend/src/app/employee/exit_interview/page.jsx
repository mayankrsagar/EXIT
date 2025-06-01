// src/app/employee/exit_interview/page.js
"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/config/apiUrl';

export default function ExitInterviewPage() {
  const [resignationId, setResignationId] = useState("");
  const [responses, setResponses] = useState([
    { questionText: "What motivated you to leave?", response: "" },
    { questionText: "Any suggestions for improvement?", response: "" },
  ]);
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

  const handleChange = (idx, field, value) => {
    const newResponses = [...responses];
    newResponses[idx][field] = value;
    setResponses(newResponses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}user/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resignationId, responses }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || data.message || "Submission failed");
      } else {
        setMessage("Exit interview submitted successfully!");
        setResignationId("");
        setResponses((prev) => prev.map((q) => ({ ...q, response: "" })));
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
      console.error(err);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Exit Interview</h2>
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
          <label htmlFor="resignationId" className="block text-sm font-medium">
            Resignation ID
          </label>
          <input
            id="resignationId"
            type="text"
            value={resignationId}
            onChange={(e) => setResignationId(e.target.value)}
            required
            placeholder="e.g. 64a1b2c3d4e5f6a7b8c9d0e"
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the resignation ID given to you upon approval.
          </p>
        </div>

        {responses.map((item, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium">
              {item.questionText}
            </label>
            <textarea
              rows="3"
              value={item.response}
              onChange={(e) => handleChange(idx, "response", e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Submit Exit Interview
        </button>
      </form>
    </div>
  );
}
