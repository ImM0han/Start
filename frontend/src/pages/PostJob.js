import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";

export default function PostJob() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    location: "",
    category: ""
  });

  const navigate = useNavigate();

  const categories = [
    "Construction & Labour Services",
    "Home Cleaning & Daily Help", 
    "Repair & Installation Services",
    "Daily Wage"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        budget: parseInt(formData.budget)
      };

      await API.post("/jobs", jobData);
      alert("Job posted successfully!");
      navigate("/client-dashboard");
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/client-dashboard");
  };

  return (
    <div className="phonePage">
      <div className="phoneFrame">
        {/* Header */}
        <div className="pHeader">
          <div className="pHeaderLeft">
            <div className="squareIcon">📝</div>
            <div>
              <div className="pName">Post a Job</div>
            </div>
          </div>
          <div className="pHeaderRight">
            <div className="bell">🔔</div>
          </div>
        </div>

        {/* Body */}
        <div className="pBody">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label className="labelSm">Job Title</label>
              <div className="inputRow">
                <span className="icon">📋</span>
                <input
                  className="inp"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Plumbing repair"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className="labelSm">Category</label>
              <div className="inputRow">
                <span className="icon">🏷️</span>
                <select
                  className="inp"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{ border: "none", background: "transparent" }}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className="labelSm">Budget (₹)</label>
              <div className="inputRow">
                <span className="icon">💰</span>
                <input
                  className="inp"
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className="labelSm">Location</label>
              <div className="inputRow">
                <span className="icon">📍</span>
                <input
                  className="inp"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Delhi, Mumbai"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="labelSm">Description</label>
              <textarea
                className="inp"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job in detail..."
                rows="4"
                required
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                className="pReject"
                style={{ flex: 1, height: "44px" }}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pAccept"
                style={{ flex: 1, height: "44px" }}
                disabled={loading}
              >
                {loading ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}