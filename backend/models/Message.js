const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
 jobId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Job"
 },
 sender:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },
 text:String,
 createdAt:{
  type:Date,
  default:Date.now
 }
});

module.exports = mongoose.model("Message",messageSchema);
