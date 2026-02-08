import React, { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import "../App.css";

export default function Dashboard() {
  const role = localStorage.getItem("role"); // "partner" | "client"

  const [me, setMe] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);

      const meRes = await API.get("/auth/me");
      const meData = meRes.data;
      setMe(meData);

      // Client view (for now show all)
      if (role !== "partner") {
        const all = await API.get("/jobs");
        setJobs(all.data || []);
        return;
      }

      // Partner view: skills-filtered categories
      const skills = meData.skills || [];
      if (skills.length === 0) {
        setJobs([]);
        return;
      }

      const results = await Promise.all(
        skills.map((c) => API.get(`/jobs?category=${encodeURIComponent(c)}`))
      );

      const merged = results.flatMap((r) => r.data || []);
      const unique = Array.from(new Map(merged.map((j) => [j._id, j])).values());

      // Partner should see open jobs only
      const openOnly = unique.filter((j) => (j.status || "open") === "open");
      setJobs(openOnly);
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Partner: toggle online
  const toggleOnline = async () => {
    if (!me) return;
    const next = !(me.online ?? true);

    setMe((p) => ({ ...p, online: next }));
    try {
      await API.put("/auth/me", { online: next });
    } catch {
      setMe((p) => ({ ...p, online: !next }));
      alert("Failed to update online status");
    }
  };

  // Accept/Reject
  const acceptJob = async (id) => {
    try {
      await API.put(`/jobs/${id}/accept`);
      await load();
    } catch (err) {
      alert(err?.response?.data?.msg || "Accept failed");
    }
  };

  const rejectJob = async (id) => {
    try {
      await API.put(`/jobs/${id}/reject`);
      await load();
    } catch (err) {
      alert(err?.response?.data?.msg || "Reject failed");
    }
  };

  const name = useMemo(() => me?.name || localStorage.getItem("name") || "User", [me]);
  const online = useMemo(() => me?.online ?? true, [me]);
  const wallet = useMemo(() => Number(me?.balance ?? 0), [me]);

  const formatMoney = (n) =>
    Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const distanceText = (job) => {
    if (job.distance) return `${job.distance} miles`;
    const seed = (job._id || "").slice(-2);
    const x = parseInt(seed, 16);
    const val = Number.isFinite(x) ? (x % 50) / 10 + 0.6 : 2.5;
    return `${val.toFixed(1)} miles`;
  };

  const payText = (job) => {
    const p = job.pricePerDay ?? job.budget ?? job.pay ?? 200;
    return `$ ${p}/day`;
  };

  return (
    <div className="webShell">
      <div className="webContainer">
        {/* Responsive nav: desktop top bar, mobile fixed bottom */}
        <BottomNav />

        {/* Header (green like screenshot) */}
       <div className="dashGreen">
  {/* LEFT = Wallet */}
  <div className="dashGreenLeft">
    <div className="dashWalletLabel">Wallet Balance</div>
    <div className="dashWalletValue">₹ {formatMoney(wallet)}</div>
  </div>

  {/* RIGHT = Name + role + status */}
  <div className="dashGreenRight">
    <div className="dashUserName">{name}</div>
    <div className="dashMiniRow">
      <span className="dashRole">{role}</span>

      {role === "partner" && (
        <button type="button" className="dashOnlineBtn" onClick={toggleOnline}>
          <span className={online ? "dashDot on" : "dashDot off"} />
          {online ? "Online" : "Offline"}
        </button>
      )}
    </div>
  </div>
</div>


        <h2 className="nearbyTitleWeb">Nearby Jobs</h2>

        {role === "partner" && (me?.skills?.length || 0) === 0 && (
          <div className="pEmpty">
            Select your skills in <b>Profile</b> to see matching jobs.
          </div>
        )}

        {loading && <div className="pLoading">Loading...</div>}

        {!loading && (
          <div className="jobsGrid">
            {jobs.map((job) => (
              <div key={job._id} className="pCard">
                <div className="pCardTop">
                  <div className="pJobTitle">{cap(job.category || "Job")}</div>
                  <div className="pPill">{cap(job.category || "Category")}</div>
                </div>

                <div className="pMeta">📍 {distanceText(job)}</div>
                <div className="pPay">{payText(job)}</div>
                <div className="pDesc">{job.description || job.details || "No description"}</div>

                {role === "partner" && (
                  <div className="pActions">
                    <button className="pAccept" onClick={() => acceptJob(job._id)}>
                      Accept
                    </button>
                    <button className="pReject" onClick={() => rejectJob(job._id)}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* spacer so mobile bottom nav doesn't cover content */}
        <div className="mobileNavSpacer" />
      </div>
    </div>
  );
}

function cap(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
