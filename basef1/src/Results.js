import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./Api";

export default function Results({ favoriteTeam }) {
  const [seasons, setSeasons] = useState([]);
  const [seasonId, setSeasonId] = useState("");
  const [results, setResults] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/api/seasons")
      .then((d) => {
        setSeasons(d.seasons || []);
        // default: najnovija sezona
        if (d.seasons?.length) setSeasonId(String(d.seasons[0].id));
      })
      .catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!seasonId) return;

    setLoading(true);
    setErr("");

    apiFetch(`/api/results?seasonId=${encodeURIComponent(seasonId)}`)
      .then((d) => setResults(d.results || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [seasonId]);

  const seasonLabel = useMemo(() => {
    const s = seasons.find((x) => String(x.id) === String(seasonId));
    return s ? s.yr : "";
  }, [seasons, seasonId]);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <div className="label" style={{ minWidth: 160 }}>
          Season
          <select className="select" value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.yr}
              </option>
            ))}
          </select>
        </div>

        <div className="small">
          {seasonLabel ? <>Showing standings for <b>{seasonLabel}</b></> : null}
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      {loading ? (
        <div className="small">Loading...</div>
      ) : (
        <div className="tableWrapper">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: "10px 8px", color: "#9ca3af", fontWeight: 600 }}>#</th>
              <th style={{ padding: "10px 8px", color: "#9ca3af", fontWeight: 600 }}>Driver</th>
              <th style={{ padding: "10px 8px", color: "#9ca3af", fontWeight: 600 }}>Team</th>
              <th style={{ padding: "10px 8px", color: "#9ca3af", fontWeight: 600 }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={r.driver_id} style={{background: r.primary_color ? r.primary_color + "20" : "transparent"}}>
                <td style={{ padding: "10px 8px" }}>{idx + 1}</td>
                <td style={{ padding: "10px 8px" }}>
                  <b>{r.driver_name}</b>
                </td>
                <td style={{ padding: "10px 8px" }}><span style={{fontWeight: r.team_name === favoriteTeam ? "700" : "400", color: r.team_name === favoriteTeam ? "white" : "#9ca3af"}}>{r.team_name === favoriteTeam && "⭐ "}{r.team_name}</span></td>
                <td style={{ padding: "10px 8px" }}>
                  <b>{Number(r.total_points) || 0}</b>
                </td>
              </tr>
            ))}

            {!results.length && !err && (
              <tr>
                <td colSpan={4} style={{ padding: "12px 8px", color: "#9ca3af" }}>
                  No results for this season.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}