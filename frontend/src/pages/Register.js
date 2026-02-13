import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../App.css";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = details, 2 = otp+password
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // optional
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("partner"); // default role


  const sendOtp = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Name required");
    if (phone.trim().length !== 10) return alert("Enter valid 10 digit phone");

    try {
      setLoading(true);

      // For now backend returns otp just for testing OR you can ignore it
      await API.post("/auth/send-otp", { phone });

      alert("OTP sent! (Use 123456 for now)");
      setStep(2);
    } catch (err) {
      alert(err?.response?.data?.msg || err?.response?.data || "OTP failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();

    if (otp.trim().length !== 6) return alert("Enter 6 digit OTP");
    if (password.trim().length < 6) return alert("Password min 6 chars");

    try {
      setLoading(true);

      const res = await API.post("/auth/register", {
  name,
  phone,
  email: email.trim() ? email.trim() : null,
  otp,
  password,
  role   // <-- THIS is what we are adding
});



      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);

      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.msg || err?.response?.data || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authHeader">
        <div className="authHeaderIcon">👋</div>
        <h1 className="authHeaderTitle">Create Account</h1>
        <p className="authHeaderSub">
          {step === 1 ? "Phone required, Email optional" : "Verify OTP & set password"}
        </p>
      </div>

      <div className="authContainer">
        <div className="authCardWeb">
          <label className="labelSm">Register as</label>
<div className="roleRow">
  <button
    type="button"
    className={role === "partner" ? "roleBtn active" : "roleBtn"}
    onClick={() => setRole("partner")}
  >
    Partner
  </button>
  <button
    type="button"
    className={role === "client" ? "roleBtn active" : "roleBtn"}
    onClick={() => setRole("client")}
  >
    Client
  </button>
</div>

          {step === 1 && (
            <form onSubmit={sendOtp}>
              <label className="labelSm">Full Name</label>
              <div className="inputRow">
                <span className="icon">👤</span>
                <input
                  className="inp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <label className="labelSm">Phone Number</label>
              <div className="inputRow">
                <span className="icon">📱</span>
                <input
                  className="inp"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10 digit phone"
                  maxLength={10}
                  required
                />
              </div>

              <label className="labelSm">Email (optional)</label>
              <div className="inputRow">
                <span className="icon">✉</span>
                <input
                  className="inp"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com (optional)"
                />
              </div>

              <button className="blackBtn" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <p className="bottomText">
                Already have account?{" "}
                <Link className="bottomLink" to="/login">
                  Login
                </Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={register}>
              <label className="labelSm">Enter OTP</label>
              <div className="inputRow">
                <span className="icon">🔐</span>
                <input
                  className="inp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Use 123456"
                  inputMode="numeric"
                  required
                />
              </div>

              <label className="labelSm">Create Password</label>
              <div className="inputRow">
                <span className="icon">🔒</span>
                <input
                  className="inp"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
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

              <button className="blackBtn" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>

              <p
                className="bottomText"
                style={{ cursor: "pointer" }}
                onClick={() => setStep(1)}
              >
                Change details
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
