import { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000/api";

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("pp_token");
  const res   = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

export default function App() {
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pp_user")) || null; }
    catch { return null; }
  });

  const handleLoginSuccess = (user) => setCurrentUser(user);
  const handleLogout = () => {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_user");
    setCurrentUser(null);
    setPage("home");
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  return (
    <div>
      <p style={{padding: 40, fontFamily: "sans-serif", textAlign: "center"}}>
        <strong>App.js placeholder</strong><br/><br/>
        Please replace this file with the full App.js you already have.<br/>
        Copy your original App.js into: <code>pawpatrol-frontend/src/App.js</code>
      </p>
    </div>
  );
}
