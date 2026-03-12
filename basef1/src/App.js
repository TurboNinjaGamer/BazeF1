import React, { useEffect, useState } from "react";
import { apiFetch, tokenStore } from "./Api";
import Login from "./Login";
import Register from "./Register";
import "./App.css";
import Results from "./Results";

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");

  async function loadMe() {
    const { user } = await apiFetch("/api/me");
    setUser(user);

    // apply theme colors (CSS variables)
    document.documentElement.style.setProperty("--primary", user.primary_color);
    document.documentElement.style.setProperty("--secondary", user.secondary_color);
  }

  useEffect(() => {
    if (tokenStore.get()) {
      loadMe().catch(() => {
        tokenStore.clear();
        setUser(null);
      });
    }
  }, []);

  // Not logged in → centered auth card
  if (!tokenStore.get()) {
    return (
      <div className="page">
        <div className="card">
          {mode === "login" ? <Login onDone={loadMe} /> : <Register onDone={loadMe} />}

          <div className="switch">
            {mode === "login" ? (
              <button type="button" onClick={() => setMode("register")}>
                Create account
              </button>
            ) : (
              <button type="button" onClick={() => setMode("login")}>
                I already have an account
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <div className="card">Loading...</div>
      </div>
    );
  }

  // Logged in → app shell (results will go here later)
  return (
    <div className="page">
      <div style={{ width: "100%", maxWidth: 900 }}>
        <div className="topbar">
          <div className="pill">
            <span className="dot" />
            <span>
              Logged in as <b>{user.username}</b>
            </span>
          </div>

          <div className="pill">
            Team: <b>{user.team_name}</b>
          </div>

          <button
            className="btn"
            type="button"
            onClick={() => {
              tokenStore.clear();
              setUser(null);
            }}
          >
            Logout
          </button>
        </div>

        <div className="card">
          <Results favoriteTeam={user.team_name} />
        </div>
      </div>
    </div>
  );
}