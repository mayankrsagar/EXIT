"use client";

import { useState } from 'react';

import axios from 'axios';
import { useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/config/apiUrl';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Rudimentary JWT‐decode helper to extract payload
  function parseJwt(token) {
    try {
      const base64Payload = token.split(".")[1];
      const payload = atob(base64Payload);
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = response.data;
      const token = data.token;
      localStorage.setItem("token", token);

      // Decode JWT payload to read role
      const payload = parseJwt(token);
      const role = payload?.role || "EMPLOYEE";
      localStorage.setItem("role", role);

      // Redirect based on role
      if (role === "HR") {
        router.push("/admin/resignations");
      } else {
        router.push("/employee/resign");
      }
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        setErrorMsg(data.error || data.message || "Login failed");
      } else if (err.request) {
        setErrorMsg("No response from server. Please try again later.");
      } else {
        setErrorMsg("An unexpected error occurred");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Login</h2>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="mt-1 flex items-center">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="ml-2 text-gray-600 hover:text-gray-800 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
