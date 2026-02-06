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
    default: "open"
  },
  category:String,
location:String,
},{timestamps:true});

module.exports = mongoose.model("Job",jobSchema);
