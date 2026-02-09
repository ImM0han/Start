import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import "../App.css";

export default function MyJobs() {
  const role = localStorage.getItem("role"); // "partner" | "client"
  const token = localStorage.getItem("token");

  const [me, setMe] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const myId = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1])).id;
    } catch {
      return null;
    }
  }, [token]);

  const load = async () => {
    try {
      setLoading(true);

      const [meRes, jobsRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/jobs"),
      ]);

      setMe(meRes.data || null);
      setJobs(jobsRes.data || []);
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name = useMemo(
    () => me?.name || localStorage.getItem("name") || "User",
    [me]
  );
  const wallet = useMemo(() => Number(me?.balance ?? 0), [me]);

  const formatMoney = (n) =>
    Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDateTime = (val) => {
    if (!val) return "-";
    try {
      return new Date(val).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(val);
    }
  };

  const formatAmount = (job) => {
    const raw =
      job.totalAmount ??
      job.amountReceived ??
      job.paidAmount ??
      job.pricePerDay ??
      job.budget ??
      job.pay ??
      0;
    return `₹ ${formatMoney(raw)}`;
  };

  const partnerJobs = useMemo(() => {
    if (!myId) return [];
    if (role === "partner") {
      return jobs.filter((j) => j.workerId?._id === myId);
    }
    // client view: show as client
    return jobs.filter((j) => j.clientId?._id === myId);
  }, [jobs, myId, role]);

  return (
    <div className="webShell">
      <div className="webContainer">
        {/* Shared bottom/top nav */}
        <BottomNav />

        <h2 className="nearbyTitleWeb">
          {role === "partner" ? "My Job Transactions" : "My Posted Jobs"}
        </h2>

        {loading && <div className="pLoading">Loading...</div>}

        {!loading && partnerJobs.length === 0 && (
          <div className="pEmpty">
            {role === "partner"
              ? "You don't have any completed or assigned jobs yet."
              : "You haven't posted any jobs yet."}
          </div>
        )}

        {!loading && partnerJobs.length > 0 && (
          <div className="jobsGrid">
            {partnerJobs.map((job) => {
              const start =
                job.startTime ||
                job.startDate ||
                job.assignedAt ||
                job.createdAt;
              const end =
                job.endTime || job.endDate || job.completedAt || job.updatedAt;

              return (
                <div key={job._id} className="pCard">
                  <div className="pCardTop">
                    <div className="pJobTitle">
                      {job.title || cap(job.category || "Job")}
                    </div>
                    <div className="pPill">
                      {cap(job.status || "In progress")}
                    </div>
                  </div>

                  <div className="pMeta">
                    <span>
                      Start: <b>{formatDateTime(start)}</b>
                    </span>
                    <br />
                    <span>
                      End: <b>{formatDateTime(end)}</b>
                    </span>
                  </div>

                  <div className="pPay">
                    Amount: <span>{formatAmount(job)}</span>
                  </div>

                  <div className="pDesc">
                    {job.description ||
                      job.details ||
                      (role === "partner"
                        ? "Job you have worked on."
                        : "Job you have posted.")}
                  </div>
                </div>
              );
            })}
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

