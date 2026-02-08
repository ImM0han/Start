const router = require("express").Router();
const Message = require("../models/Message");
const auth = require("../middlewares/auth");

// get messages
router.get("/:jobId",auth,async(req,res)=>{
 const msgs = await Message.find({jobId:req.params.jobId})
  .populate("sender","name");
 res.json(msgs);
});
router.get("/count/:jobId",auth,async(req,res)=>{
 const count = await Message.countDocuments({jobId:req.params.jobId});
 res.json(count);
});


// send message
router.post("/:jobId",auth,async(req,res)=>{
 const msg = await Message.create({
  jobId:req.params.jobId,
  sender:req.user.id,
  text:req.body.text
 });

 res.json(msg);
});

module.exports = router;
