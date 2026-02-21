import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // If user is a client, redirect to client dashboard
  useEffect(() => {
    if (role === "client") {
      navigate("/client-dashboard");
    }
  }, [role, navigate]);

  const loadMe = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      navigate("/");
    }
  };

  const loadJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadMe(), loadJobs()]);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acceptJob = async (jobId) => {
    if (!window.confirm("Accept this job?")) return;

    try {
      await API.post(`/jobs/${jobId}/accept`);
      await loadJobs();
      alert("Job accepted!");
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to accept job");
    }
  };

  // cap helper
  const cap = (s) => {
    if (!s) return "";
    return s
      .split(" ")
      .map((p) => p[0]?.toUpperCase() + p.slice(1)?.toLowerCase())
      .join(" ");
  };
  
const getInitial = (name) =>
  name?.trim()?.[0] ? name.trim()[0].toUpperCase() : "P";
const getSkillEmoji = (skill) => {
  const s = skill?.toLowerCase();

  if (!s) return "💼";
  if (s.includes("plumb")) return "🚰";
  if (s.includes("electric")) return "⚡";
  if (s.includes("mason")) return "🧱";
  if (s.includes("carpenter")) return "🪚";
  if (s.includes("painter")) return "🎨";
  if (s.includes("clean")) return "🧹";
  if (s.includes("mechanic")) return "🔧";

  return "🛠️"; // fallback
};
  return (
    <div className="webShell">
      <div className="webContainer">
        {/* NAV (Top on desktop, Bottom on mobile via CSS) */}
        <BottomNav />

        {/* Header */}
        <div className="pHeader">
          <div className="pHeaderLeft">
            <div className="squareIcon">
  {Array.isArray(user?.skills) && user.skills.length > 0
    ? getSkillEmoji(user.skills[0])
    : "💼"}
</div>
            <div>
              <div className="pName">
                {loading ? "Loading..." : `Hi, ${cap(user?.name)}!`}
              </div>
              <div className="pSkillsRow">
  {Array.isArray(user?.skills) && user.skills.length > 0 ? (
    user.skills.slice(0, 3).map((sk) => (
      <span key={sk} className="pSkillPill">{sk}</span>
    ))
  ) : (
    <span className="pSkillHint">Select skills in Profile</span>
  )}

  {Array.isArray(user?.skills) && user.skills.length > 3 && (
    <span className="pSkillMore">+{user.skills.length - 3}</span>
  )}
</div>
            </div>
          </div>

          <div className="pHeaderRight">
            <div className="avatarWrap">
              <div
                className="avatarCircle"
                style={{
                  backgroundImage: user?.avatarUrl ? `url(${user?.avatarUrl})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: user?.avatarUrl ? "block" : "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!user?.avatarUrl && getInitial(user?.name)}
              </div>
              <div className="bell">🔔</div>
            </div>

            <div className="walletBox">
              <div className="walletLabel">Balance</div>
              <div className="walletValue">₹{user?.balance || 0}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="pBody">
          {loading ? (
            <div className="pLoading">Loading jobs...</div>
          ) : (
            <>
              <h2 className="nearbyTitleWeb">Nearby Jobs</h2>

              {jobs.length === 0 ? (
                <div className="pEmpty">
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "10px" }}>📋</div>
                    <div>No jobs available right now</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(0,0,0,.6)",
                        marginTop: "4px",
                      }}
                    >
                      Jobs will appear here when posted
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job._id} className="pCard">
                      <div className="pCardTop">
                        <div className="pJobTitle">{job.title}</div>
                        <div className="pPill">{job.category}</div>
                      </div>

                      <div className="pMeta">
                        <span>👷 {job.clientName}</span>
                        <span>📍 {job.location}</span>
                      </div>

                      <div className="pPay">₹{job.budget}</div>
                      <div className="pDesc">{job.description}</div>

                      <div className="pActions">
                        <button
                          className="pReject"
                          onClick={() => navigate(`/chat/${job._id}`)}
                        >
                          Chat
                        </button>
                        <button className="pAccept" onClick={() => acceptJob(job._id)}>
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* IMPORTANT: space for bottom nav on mobile */}
          <div className="mobileNavSpacer" />
        </div>
      </div>
    </div>
  );
}