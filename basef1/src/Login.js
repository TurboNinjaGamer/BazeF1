import React, { useState } from "react";
import { apiFetch, tokenStore } from "./Api";

export default function Login({ onDone }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      const { token } = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      tokenStore.set(token);
      onDone();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>Log in</h2>

      <div className="label">
        Username
        <input
          className="input"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="label">
        Password
        <input
          className="input"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {err && <div className="error">{err}</div>}

      <button className="btn btnPrimary" type="submit">
        Sign in
      </button>
    </form>
  );
}