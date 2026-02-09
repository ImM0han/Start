import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import "../App.css";

export default function Wallet() {
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
      alert(err?.response?.data?.msg || "Failed to load wallet");
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
  const walletBalance = useMemo(() => Number(me?.balance ?? 0), [me]);

  const formatMoney = (n) =>
    Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (val) => {
    if (!val) return "-";
    try {
      return new Date(val).toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return String(val);
    }
  };

  const jobAmount = (job) => {
    const raw =
      job.totalAmount ??
      job.amountReceived ??
      job.paidAmount ??
      job.pricePerDay ??
      job.budget ??
      job.pay ??
      0;
    return raw;
  };

  // Basic earnings aggregation from completed jobs
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();
  const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000;

  const myCompletedJobs = useMemo(() => {
    if (!myId) return [];
    const owned = jobs.filter((j) =>
      role === "partner" ? j.workerId?._id === myId : j.clientId?._id === myId
    );
    return owned.filter((j) => (j.status || "").toLowerCase() === "completed");
  }, [jobs, myId, role]);

  const { todayEarnings, weekEarnings } = useMemo(() => {
    let todaySum = 0;
    let weekSum = 0;

    myCompletedJobs.forEach((j) => {
      const dStr =
        j.completedAt || j.endTime || j.endDate || j.updatedAt || j.createdAt;
      const t = dStr ? new Date(dStr).getTime() : undefined;
      const amt = jobAmount(j);
      if (!Number.isFinite(t) || !Number.isFinite(amt)) return;

      if (t >= startOfWeek && t <= startOfToday + 24 * 60 * 60 * 1000) {
        weekSum += amt;
      }
      if (t >= startOfToday && t <= startOfToday + 24 * 60 * 60 * 1000) {
        todaySum += amt;
      }
    });

    return { todayEarnings: todaySum, weekEarnings: weekSum };
  }, [myCompletedJobs, startOfToday, startOfWeek]);

  const recentActivity = useMemo(() => {
    return myCompletedJobs
      .slice()
      .sort((a, b) => {
        const da =
          new Date(
            a.completedAt || a.endTime || a.endDate || a.updatedAt || a.createdAt
          ).getTime() || 0;
        const db =
          new Date(
            b.completedAt || b.endTime || b.endDate || b.updatedAt || b.createdAt
          ).getTime() || 0;
        return db - da;
      })
      .slice(0, 10);
  }, [myCompletedJobs]);

  const initial = (name || "U").charAt(0).toUpperCase();

  return (
    <div className="webShell">
      <div className="webContainer">
        <BottomNav />

        {/* Top row: back + title + avatar */}
        <div className="walletHeaderRow">
          <button
            type="button"
            className="walletBackBtn"
            onClick={() => window.history.back()}
          >
            ←
          </button>
          <div className="walletTitle">Earnings &amp; Wallet</div>
          <div className="walletAvatar">{initial}</div>
        </div>

        {/* Main summary card */}
        <div className="walletSummaryCard">
          <div className="walletSummaryLabel">Total Balance</div>
          <div className="walletSummaryAmount">
            ₹ {formatMoney(walletBalance)}
          </div>

          <div className="walletSummaryRow">
            <div className="walletSummaryCol">
              <div className="walletSummarySubLabel">Today's Earnings</div>
              <div className="walletSummarySubValue">
                ₹ {formatMoney(todayEarnings)}
              </div>
            </div>
            <div className="walletSummaryCol">
              <div className="walletSummarySubLabel">This Week's Earnings</div>
              <div className="walletSummarySubValue">
                ₹ {formatMoney(weekEarnings)}
              </div>
            </div>
          </div>
        </div>

        <button type="button" className="walletPrimaryBtn">
          Withdraw to Bank
        </button>

        <div className="walletSectionTitle">Recent Activity</div>

        {loading && <div className="pLoading">Loading...</div>}

        {!loading && recentActivity.length === 0 && (
          <div className="pEmpty">
            No completed jobs yet. Finish a job to see earnings here.
          </div>
        )}

        {!loading && recentActivity.length > 0 && (
          <div className="walletList">
            {recentActivity.map((job) => {
              const d =
                job.completedAt ||
                job.endTime ||
                job.endDate ||
                job.updatedAt ||
                job.createdAt;

              return (
                <div key={job._id} className="walletItem">
                  <div className="walletItemIcon">💸</div>
                  <div className="walletItemMain">
                    <div className="walletItemTitle">
                      {job.title || cap(job.category || "Job")}
                    </div>
                    <div className="walletItemDate">{formatDate(d)}</div>
                  </div>
                  <div className="walletItemRight">
                    <div className="walletItemCurrency">₹</div>
                    <div className="walletItemAmount">
                      {formatMoney(jobAmount(job))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mobileNavSpacer" />
      </div>
    </div>
  );
}

function cap(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

