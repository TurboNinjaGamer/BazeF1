import React, { useEffect, useState } from "react";
import { apiFetch, tokenStore } from "./Api";

export default function Register({ onDone }) {
  const [teams, setTeams] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [teamId, setTeamId] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch("/api/teams")
      .then((data) => setTeams(data.teams))
      .catch((e) => setErr(e.message));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      const { token } = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          teamId: Number(teamId)
        })
      });

      tokenStore.set(token);
      onDone();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>Create account</h2>

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

      <div className="label">
        Favorite Team
        <select
          className="select"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        >
          <option value="">Select team</option>

          {(teams || []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {err && <div className="error">{err}</div>}

      <button className="btn btnPrimary" type="submit" disabled={!teamId}>
        Create account
      </button>
    </form>
  );
}