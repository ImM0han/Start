exports.completeJob = async(req,res)=>{

 const job = await Job.findById(req.params.id);

 const client = await User.findById(job.clientId);
 const worker = await User.findById(job.workerId);

 if(client.balance < job.price)
  return res.status(400).json({msg:"Not enough balance"});

 client.balance -= job.price;
 worker.balance += job.price;

 await client.save();
 await worker.save();

 job.status="completed";
 await job.save();

 res.json({job,client,worker});
};
const User = require("../models/User");
