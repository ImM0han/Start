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
  }, []);

  const acceptJob = async (jobId) => {
    if (!window.confirm("Accept this job?")) return;

    try {
      await API.put(`/jobs/${jobId}/accept`);
      // Refresh jobs after accepting
      loadJobs();
      alert("Job accepted!");
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to accept job");
    }
  };

  const viewProfile = () => {
    navigate("/profile");
  };

  // cap function - moved to the top to avoid function-use-before-definition error
  const cap = (s) => {
    if (!s) return "";
    return s
      .split(" ")
      .map((p) => p[0]?.toUpperCase() + p.slice(1)?.toLowerCase())
      .join(" ");
  };

  if (loading) {
    return (
      <div className="phonePage">
        <div className="phoneFrame">
          <div className="pHeader">
            <div className="pHeaderLeft">
              <div className="squareIcon">💼</div>
              <div>
                <div className="pName">Loading...</div>
                <button className="pOnlineBtn">
                  <span className="pDot on"></span>
                  <span>Online</span>
                </button>
              </div>
            </div>
            <div className="pHeaderRight">
              <div className="avatarWrap">
                <div className="avatarCircle">👤</div>
                <div className="bell">🔔</div>
              </div>
              <div className="walletBox">
                <div className="walletLabel">Balance</div>
                <div className="walletValue">₹0</div>
              </div>
            </div>
          </div>
          
          <div className="pBody">
            <div className="pLoading">Loading jobs...</div>
          </div>
          
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="phonePage">
      <div className="phoneFrame">
        {/* Header */}
        <div className="pHeader">
          <div className="pHeaderLeft">
            <div className="squareIcon">💼</div>
            <div>
              <div className="pName">Hi, {cap(user?.name)}!</div>
              <button className="pOnlineBtn">
                <span className="pDot on"></span>
                <span>Online</span>
              </button>
            </div>
          </div>
          <div className="pHeaderRight">
            <div className="avatarWrap">
              <div 
                className="avatarCircle" 
                style={{ 
                  backgroundImage: user?.avatarUrl ? `url(${user?.avatarUrl})` : 'none',
                  backgroundSize: 'cover',
                  display: user?.avatarUrl ? 'block' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!user?.avatarUrl && (user?.name?.charAt(0)?.toUpperCase() || 'P')}
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
          <h2 className="nearbyTitleWeb">Nearby Jobs</h2>
          
          {jobs.length === 0 ? (
            <div className="pEmpty">
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "10px" }}>📋</div>
                <div>No jobs available right now</div>
                <div style={{ fontSize: "12px", color: "rgba(0,0,0,.6)", marginTop: "4px" }}>
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
                    <button 
                      className="pAccept"
                      onClick={() => acceptJob(job._id)}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ height: "20px" }}></div> {/* Spacer for bottom nav */}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}