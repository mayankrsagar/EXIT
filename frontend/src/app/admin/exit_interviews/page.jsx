"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/config/apiUrl';

export default function HRExitInterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
    } else if (role !== "HR") {
      setErrorMsg("Access denied: Only HR can view this page.");
      setLoading(false);
    } else {
      fetchInterviews(token);
    }
  }, [router]);

  const fetchInterviews = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}admin/exit_responses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to fetch exit interviews");
      } else {
        setInterviews(data.exitInterviews || []);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (errorMsg) {
    return <div className="text-center mt-10 text-red-600">{errorMsg}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">All Exit Interviews</h2>
      {interviews.length === 0 ? (
        <p>No interviews submitted yet.</p>
      ) : (
        interviews.map((interview, index) => (
          <div key={index} className="border-b border-gray-300 mb-4 pb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Resignation ID:</strong> {interview.resignationId}
            </p>
            {interview.responses.map((response, idx) => (
              <div key={idx} className="mb-2">
                <p className="font-medium">{response.questionText}</p>
                <p className="text-gray-700">{response.response}</p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
