const router = require("express").Router();
const { register, login, sendOtp } = require("../controllers/authController");
const auth = require("../middlewares/auth");
const User = require("../models/User");
const { forgotPasswordSendOtp, resetPassword } = require("../controllers/authController");

router.post("/forgot-password/send-otp", forgotPasswordSendOtp);
router.post("/forgot-password/reset", resetPassword);
router.post("/send-otp", sendOtp);
router.post("/register", register);
router.post("/login", login);

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

router.put("/me", auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      skills,
      online,
      language,
      avatarUrl,
      aadhaarNumber,
      aadhaarVerified,
      pushNotifications,
      biometric,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (typeof name === "string" && name.trim()) user.name = name.trim();
    if (typeof phone === "string" && phone.trim()) user.phone = phone.trim();
    if (typeof email === "string") user.email = email.trim();
    if (typeof address === "string") user.address = address;

    if (Array.isArray(skills)) user.skills = skills;
    if (typeof online === "boolean") user.online = online;

    if (typeof language === "string" && language.trim()) {
      user.language = language.trim();
    }

    if (typeof avatarUrl === "string") user.avatarUrl = avatarUrl;

    if (typeof aadhaarNumber === "string") user.aadhaarNumber = aadhaarNumber;
    if (typeof aadhaarVerified === "boolean") {
      user.aadhaarVerified = aadhaarVerified;
    }

    if (typeof pushNotifications === "boolean") {
      user.pushNotifications = pushNotifications;
    }
    if (typeof biometric === "boolean") {
      user.biometric = biometric;
    }

    await user.save();
    res.json({ msg: "Updated", user });
  } catch (err) {
    console.error("UPDATE /auth/me error", err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
