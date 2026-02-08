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
  const { skills, online } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ msg: "User not found" });

  if (Array.isArray(skills)) user.skills = skills;
  if (typeof online === "boolean") user.online = online;

  await user.save();
  res.json({ msg: "Updated", user });
});
router.put("/me", auth, async (req, res) => {
  try {
    const { skills, online } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (Array.isArray(skills)) user.skills = skills;
    if (typeof online === "boolean") user.online = online;

    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
