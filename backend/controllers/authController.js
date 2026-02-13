const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// helper OTP
const genOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Clean up expired temporary users
const cleanupTempUsers = async () => {
  try {
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    await User.deleteMany({
      name: "temporary",
      createdAt: { $lt: cutoffTime }
    });
  } catch (err) {
    console.error("Error cleaning up temp users:", err);
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log("Send OTP request received", { phone });
    
    if (!phone || phone.length < 10) {
      console.log("Invalid phone number", { phone });
      return res.status(400).json({ msg: "Invalid phone" });
    }

    // Clean up expired temporary users
    await cleanupTempUsers();

    const otp = genOtp();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    console.log("Generated OTP for phone", { phone, otp, expires });

    // if user exists, store otp in same user (easy)
    let user = await User.findOne({ phone });
    console.log("User lookup result", { phone, userExists: !!user });

    if (!user) {
      // Create a temporary user record to store OTP for verification
      console.log("Creating temporary user for phone", { phone });
      user = await User.create({
        phone,
        name: "temporary", // temporary name until registration completes
        password: "temp", // temporary password that won't be used
        email: `${phone}@temp.local` // unique temporary email to avoid duplicate null errors
      });
      console.log("Temporary user created", { userId: user._id, phone: user.phone });
    }

    user.otpCode = otp;
    user.otpExpires = expires;
    await user.save();
    console.log("OTP saved for user", { userId: user._id, otp: user.otpCode, expires: user.otpExpires });

    // ✅ For now we return otp for testing. Later send SMS.
    res.json({ msg: "OTP sent", otp });
  } catch (err) {
    console.error("Send OTP ERROR:", err);
    res.status(500).json({ msg: "Server error", err });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, role, otp } = req.body;
    console.log("Register request received", { phone, name, email, role, otp });

    if (!name) return res.status(400).json({ msg: "Name required" });
    if (!phone || phone.length !== 10) return res.status(400).json({ msg: "Phone must be 10 digits" });
    if (!password || password.length < 6) return res.status(400).json({ msg: "Password min 6 chars" });
    if (!otp || otp.length !== 6) return res.status(400).json({ msg: "OTP required" });
    
    // First, check if a non-temporary user already exists
    const existingRegisteredUser = await User.findOne({ phone, name: { $ne: "temporary" } });
    if (existingRegisteredUser) {
      console.log("Phone already registered with a real account", { phone });
      return res.status(400).json({ msg: "Phone already registered" });
    }
    
    // Validate OTP - find the user (could be temporary or registered) to validate OTP
    console.log("Finding user for OTP validation", { phone });
    const user = await User.findOne({ phone });
    if (!user) {
      console.log("User not found for OTP validation", { phone });
      return res.status(400).json({ msg: "User not found" });
    }
    
    // If this is a non-temporary user that already completed registration, they can't register again
    if (user.name !== "temporary") {
      console.log("Attempting to re-register an already registered user", { phone, userId: user._id, userName: user.name });
      return res.status(400).json({ msg: "Phone already registered" });
    }
    
    console.log("Validating OTP for temporary user", { userId: user._id, otpCode: user.otpCode, otpExpires: user.otpExpires });
    
    if (!user.otpCode || !user.otpExpires) {
      console.log("OTP not requested", { phone, userId: user._id });
      return res.status(400).json({ msg: "OTP not requested" });
    }
    if (new Date() > new Date(user.otpExpires)) {
      console.log("OTP expired", { phone, userId: user._id, otpExpires: user.otpExpires, currentTime: new Date() });
      return res.status(400).json({ msg: "OTP expired" });
    }
    if (otp !== user.otpCode) {
      console.log("Invalid OTP", { phone, userId: user._id, providedOtp: otp, storedOtp: user.otpCode });
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    
    // Clear OTP after successful validation
    user.otpCode = undefined;
    user.otpExpires = undefined;
    
    // Hash the password
    const hashed = await bcrypt.hash(password, 10);
    
    // Update the existing temporary user with actual data
    user.name = name;
    // Ensure email is properly set - use provided email or keep as null (don't use temp email)
    // If the user provided an email, use it; otherwise keep as null (not the temp email)
    const userEmail = email?.trim() ? email.trim() : null;
    user.email = userEmail;
    user.password = hashed;
    user.role = role || "partner";
    user.balance = 0;
    user.otpCode = undefined;  // Clear OTP after successful registration
    user.otpExpires = undefined;  // Clear OTP expiration
    
    // If user had a temporary email from OTP stage, replace it with provided email or null
    if (user.email === null && email && email.trim()) {
      user.email = email.trim();
    }
    
    try {
      await user.save();
    } catch (saveErr) {
      if (saveErr.code === 11000 && saveErr.message.includes('email')) {
        // Handle duplicate email error specifically
        console.log("Duplicate email error during registration", { userId: user._id, phone: user.phone });
        // Try updating without changing email field if it's causing issues
        const updateResult = await User.updateOne(
          { _id: user._id },
          { 
            $set: {
              name: name,
              password: hashed,
              role: role || "partner",
              balance: 0,
              otpCode: undefined,
              otpExpires: undefined
            }
          }
        );
        console.log("Updated user without email field", { updateResult });
      } else {
        throw saveErr; // Re-throw if it's a different error
      }
    }
    console.log("User registration completed", { userId: user._id, name: user.name, phone: user.phone });

    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET missing in .env");
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
    const { phone, password, otp } = req.body;
    console.log("Login request received", { phone });

    if (!phone) return res.status(400).json({ msg: "Phone required" });
    if (!password) return res.status(400).json({ msg: "Password required" });

    const user = await User.findOne({ phone });
    if (!user) {
      console.log("User not found for login", { phone });
      return res.status(400).json({ msg: "User not found" });
    }
    
    // Skip login if user is a temporary user (not fully registered)
    if (user.name === "temporary") {
      console.log("Attempted login with temporary user", { userId: user._id, phone: user.phone });
      return res.status(400).json({ msg: "Please complete registration first" });
    }

    // Check if OTP is required for this user (for enhanced security)
    if (otp) {
      // Validate OTP if provided
      if (!user.otpCode || !user.otpExpires) {
        console.log("OTP provided but not requested for user", { userId: user._id, phone: user.phone });
        return res.status(400).json({ msg: "No OTP was requested for this user" });
      }
      if (new Date() > new Date(user.otpExpires)) {
        console.log("OTP expired for user", { userId: user._id, phone: user.phone });
        return res.status(400).json({ msg: "OTP expired" });
      }
      if (otp !== user.otpCode) {
        console.log("Invalid OTP provided for user", { userId: user._id, phone: user.phone, providedOtp: otp, storedOtp: user.otpCode });
        return res.status(400).json({ msg: "Invalid OTP" });
      }
      
      // Clear OTP after successful validation
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log("Wrong password for user", { userId: user._id, phone: user.phone });
      return res.status(400).json({ msg: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log("Login successful", { userId: user._id, name: user.name, phone: user.phone });

    res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role, balance: user.balance },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server error", err });
  }
};

exports.forgotPasswordSendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) return res.status(400).json({ msg: "Invalid phone" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const otp = genOtp();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await user.save();

    // ✅ For now we return otp for testing. Later send SMS.
    res.json({ msg: "OTP sent", otp });
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

