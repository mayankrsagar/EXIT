// src/app/admin/resignations/page.js
"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/config/apiUrl';

export default function HRResignationsPage() {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [approvalDate, setApprovalDate] = useState(""); // for “Approve” action
  const [selectedId, setSelectedId] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const router = useRouter();

  useEffect(() => {
    // Ensure user is HR
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "HR") {
      router.push("/login");
      return;
    }
    fetchResignations();
  }, [router]);

  const fetchResignations = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}admin/resignations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to load resignations");
      } else {
        setResignations(data.data || []);
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (id, type) => {
    setSelectedId(id);
    setActionType(type);
    if (type === "approve") {
      setApprovalDate(""); // reset date picker
      setErrorMsg(null);
    } else {
      // Immediately reject with no date needed
      confirmAndSubmit(id, false, null);
    }
  };

  const confirmAndSubmit = async (id, approved, exitDate) => {
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("token");
      const payload = { resignationId: id, approved };
      if (approved) payload.exitDate = exitDate;

      const res = await fetch(
        `${API_BASE_URL}admin/conclude_resignation`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Action failed");
      } else {
        alert(`Resignation ${approved ? "approved" : "rejected"} successfully.`);
        setSelectedId(null);
        setActionType("");
        fetchResignations();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
      console.error(err);
    }
  };

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!approvalDate) {
      setErrorMsg("Please select an exit date");
      return;
    }
    confirmAndSubmit(selectedId, true, approvalDate);
  };

  const handleCancel = () => {
    setSelectedId(null);
    setActionType("");
    setErrorMsg(null);
  };

  if (loading) {
    return <p className="text-center mt-12">Loading resignations…</p>;
  }
  if (errorMsg && resignations.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-red-100 text-red-700 px-4 py-2 rounded">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">All Resignations</h2>

      {errorMsg && (
        <div className="mb-4 max-w-lg mx-auto bg-red-100 text-red-700 px-4 py-2 rounded">
          {errorMsg}
        </div>
      )}

      {resignations.length === 0 ? (
        <p>No resignations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Employee ID</th>
                <th className="px-4 py-2 border">intendedLastWorkingDay</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resignations.map((r) => (
                <tr key={r._id} className="text-center">
                  <td className="px-4 py-2 border">{r._id.slice(-6)}</td>
                  <td className="px-4 py-2 border">
                    {r.employee._id.slice(-6)}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(r.intendedLastWorkingDay).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">{r.status}</td>
                  <td className="px-4 py-2 border">
                    {r.status === "Pending" ? (
                      <>
                        <button
                          onClick={() => handleActionClick(r._id, "approve")}
                          className="mr-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleActionClick(r._id, "reject")}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* If “Approve” was clicked, show a small form to select exitDate */}
      {actionType === "approve" && (
        <div className="max-w-md mx-auto mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Set Exit Date</h3>
          <form onSubmit={handleApproveSubmit} className="space-y-4">
            <div>
              <label htmlFor="exitDate" className="block text-sm font-medium mb-1">
                Exit Date
              </label>
              <input
                id="exitDate"
                type="date"
                value={approvalDate}
                onChange={(e) => setApprovalDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm Approval
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
