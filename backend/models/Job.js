const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  status: {
  type: String,
  enum: ["open", "assigned", "completed", "rejected"],
  default: "open"
},
partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
partnerName: { type: String, default: null },

  category:String,
location:String,
},{timestamps:true});

module.exports = mongoose.model("Job",jobSchema);
