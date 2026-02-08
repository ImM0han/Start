import React, { useEffect, useState } from "react";
import API from "../api/api";
import "../App.css";

export default function Profile() {
  const role = localStorage.getItem("role"); // "partner" or "client"
  const nameLS = localStorage.getItem("name") || "";

  const [loading, setLoading] = useState(false);

  // user details
  const [name, setName] = useState(nameLS);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // partner settings
  const [online, setOnline] = useState(true);
  const [skills, setSkills] = useState([]);

  const skillOptions = ["mason", "plumber", "electrician", "carpenter"];

  const loadMe = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/me");
      const me = res.data;

      setName(me.name || nameLS);
      setPhone(me.phone || "");
      setEmail(me.email || "");

      setOnline(me.online ?? true);
      setSkills(me.skills || []);
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);

      // update partner-only fields (and safe to send for client too)
      const res = await API.put("/auth/me", {
        skills,
        online,
      });

      // keep local name updated for UI
      if (res.data?.user?.name) {
        localStorage.setItem("name", res.data.user.name);
      }

      alert("Profile saved");
    } catch (err) {
      alert(err?.response?.data?.msg || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (s) => {
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
      <h2 style={{ margin: "6px 0 14px", fontWeight: 800 }}>Profile</h2>

      {/* Basic info card */}
      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ margin: "0 0 10px" }}>Account</h3>

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,.55)" }}>Name</div>
            <div style={{ fontWeight: 700 }}>{name || "-"}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,.55)" }}>Role</div>
            <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{role}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,.55)" }}>Phone</div>
            <div style={{ fontWeight: 700 }}>{phone || "-"}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,.55)" }}>Email</div>
            <div style={{ fontWeight: 700 }}>{email || "Not added"}</div>
          </div>
        </div>
      </div>

      {/* Partner-only settings */}
      {role === "partner" && (
        <div className="card">
          <h3 style={{ margin: "0 0 12px" }}>Partner Settings</h3>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={online}
              onChange={(e) => setOnline(e.target.checked)}
            />
            <span style={{ fontWeight: 700 }}>{online ? "Online" : "Offline"}</span>
          </div>

          <p style={{ margin: "6px 0", color: "rgba(0,0,0,.6)" }}>
            Select your skills (you will see only matching jobs)
          </p>

          <div className="skillsGrid">
            {skillOptions.map((s) => (
              <button
                key={s}
                type="button"
                className={skills.includes(s) ? "skillBtn active" : "skillBtn"}
                onClick={() => toggleSkill(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button className="blackBtn" onClick={saveProfile} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {/* Client message */}
      {role === "client" && (
        <div className="card">
          <h3 style={{ margin: "0 0 8px" }}>Client</h3>
          <p style={{ margin: 0, color: "rgba(0,0,0,.6)" }}>
            As a client, you can post jobs and hire partners.
          </p>
        </div>
      )}

      {loading && (
        <p style={{ marginTop: 12, fontSize: 12, color: "rgba(0,0,0,.55)" }}>
          Loading...
        </p>
      )}
    </div>
  );
}
