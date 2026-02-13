import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../App.css";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);

      const res = await API.post("/auth/login", {
        phone: cleanPhone,
        phoneE164: `+91${cleanPhone}`, // ✅ fallback (doesn't break if backend ignores it)
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);

      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.msg || err?.response?.data || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authHeader">
        <div className="authHeaderIcon">✈</div>
        <h1 className="authHeaderTitle">Welcome Back</h1>
        <p className="authHeaderSub">Sign in with your phone number</p>
      </div>

      <div className="authContainer">
        <div className="authCardWeb">
          <form onSubmit={submit}>
            <label className="labelSm">Phone Number</label>
            <div className="inputRow">
              <span className="icon">📱</span>
              <input
                className="inp"
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10 digit phone"
                maxLength={10}
                required
              />
            </div>

            <label className="labelSm">Password</label>
            <div className="inputRow">
              <span className="icon">🔒</span>
              <input
                className="inp"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShowPass((s) => !s)}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>

            <div className="rowLine">
              <span style={{ fontSize: 12, color: "rgba(0,0,0,.55)" }}>
                Use registered phone & password
              </span>
              <button
                type="button"
                className="linkLike"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password
              </button>
            </div>

            <button className="blackBtn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="bottomText">
            Don’t have account?{" "}
            <Link className="bottomLink" to="/register">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
