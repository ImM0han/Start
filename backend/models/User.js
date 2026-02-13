const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    phone: { type: String, required: true, unique: true },
    email: { type: String, default: null }, // optional

    password: { type: String, required: true },

    role: { type: String, enum: ["partner", "client"], default: "partner" },

    balance: { type: Number, default: 0, currency: "INR" },
    skills: { type: [String], default: [] }, // e.g. ["mason","plumber"]
    online: { type: Boolean, default: true },

    // profile extras
    address: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },

    // verification
    aadhaarNumber: { type: String, default: "" },
    aadhaarVerified: { type: Boolean, default: false },

    // preferences
    language: { type: String, default: "English" },
    pushNotifications: { type: Boolean, default: true },
    biometric: { type: Boolean, default: false },

    // OTP (mock)
    otpCode: { type: String, default: null },
    otpExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

// Index for efficient cleanup of temporary users
userSchema.index({ name: 1, createdAt: 1 });
userSchema.index({ otpExpires: 1 });

module.exports = mongoose.model("User", userSchema);
