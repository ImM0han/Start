import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import "../App.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return alert("Enter valid 10 digit phone");

    try {
      setLoading(true);
      await API.post("/auth/forgot-password/send-otp", { phone });
      alert("OTP sent! (Use 123456 for now)");
      setStep(2);
    } catch (err) {
      alert(err?.response?.data?.msg || err?.response?.data || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return alert("Enter 6 digit OTP");
    if (newPassword.length < 6) return alert("Password min 6 chars");

    try {
      setLoading(true);
      await API.post("/auth/forgot-password/reset", {
        phone,
        otp,
        newPassword,
      });

      alert("Password reset done. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err?.response?.data?.msg || err?.response?.data || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authHeader">
        <div className="authHeaderIcon">🔐</div>
        <h1 className="authHeaderTitle">Forgot Password</h1>
        <p className="authHeaderSub">
          {step === 1 ? "Enter phone to get OTP" : "Verify OTP & set new password"}
        </p>
      </div>

      <div className="authContainer">
        <div className="authCardWeb">
          {step === 1 && (
            <form onSubmit={sendOtp}>
              <label className="labelSm">Phone Number</label>
              <div className="inputRow">
                <span className="icon">📱</span>
                <input
                  className="inp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10 digit phone"
                  maxLength={10}
                  required
                />
              </div>

              <button className="blackBtn" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <p className="bottomText">
                Back to <Link className="bottomLink" to="/login">Login</Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={reset}>
              <label className="labelSm">OTP</label>
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

              <label className="labelSm">New Password</label>
              <div className="inputRow">
                <span className="icon">🔒</span>
                <input
                  className="inp"
                  type={showPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p className="bottomText" style={{ cursor: "pointer" }} onClick={() => setStep(1)}>
                Change phone number
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
