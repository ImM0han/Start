const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// helper OTP
const genOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) return res.status(400).json({ msg: "Invalid phone" });

    const otp = genOtp();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // if user exists, store otp in same user (easy)
    let user = await User.findOne({ phone });

    if (!user) {
      // create a temporary user record without password? (we avoid that)
      // Instead create a stub with dummy password? ❌ not good
      // So we just return OTP and frontend will call register next
      // We'll store OTP in a "ghost" user by creating record only when register happens
      return res.json({ msg: "OTP generated (register next)", otp }); // for testing
    }

    user.otpCode = otp;
    user.otpExpires = expires;
    await user.save();

    // ✅ For now we return otp for testing. Later send SMS.
    res.json({ msg: "OTP sent", otp });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, role, otp } = req.body;

    if (!name) return res.status(400).json({ msg: "Name required" });
    if (!phone || phone.length !== 10) return res.status(400).json({ msg: "Phone must be 10 digits" });
    if (!password || password.length < 6) return res.status(400).json({ msg: "Password min 6 chars" });
    if (!otp || otp.length !== 6) return res.status(400).json({ msg: "OTP required" });

    // mock otp
    if (otp !== "123456") return res.status(400).json({ msg: "Invalid OTP (use 123456)" });

    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ msg: "Phone already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      email: email?.trim() ? email.trim() : null,
      password: hashed,
      role: role || "partner",
      balance: 0,
    });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "JWT_SECRET missing in .env" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role, balance: user.balance },
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err); // <-- IMPORTANT
    // Duplicate phone safety
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Phone already registered" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { name, phone, email, password, role, otp } = req.body;
    const fixedRole = role === "partner" ? "partner" : role;


    if (!phone) return res.status(400).json({ msg: "Phone required" });
    if (!password) return res.status(400).json({ msg: "Password required" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role, balance: user.balance },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
};

exports.forgotPasswordSendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) return res.status(400).json({ msg: "Invalid phone" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Mock OTP system (later integrate SMS)
    user.otpCode = "123456";
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await user.save();

    res.json({ msg: "OTP sent (use 123456 for now)" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone) return res.status(400).json({ msg: "Phone required" });
    if (!otp || otp.length !== 6) return res.status(400).json({ msg: "OTP required" });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ msg: "Password min 6 chars" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // OTP checks (mock)
    if (!user.otpCode || !user.otpExpires) return res.status(400).json({ msg: "OTP not requested" });
    if (new Date() > new Date(user.otpExpires)) return res.status(400).json({ msg: "OTP expired" });
    if (otp !== user.otpCode) return res.status(400).json({ msg: "Invalid OTP" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    // clear otp
    user.otpCode = null;
    user.otpExpires = null;

    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
};

