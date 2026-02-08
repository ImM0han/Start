const Job = require("../models/Job");
const User = require("../models/User");

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      clientId: req.user.id,
      status: "open"
    });
    res.json(job);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { category } = req.query;

    const q = {};
    if (category) q.category = category;

    const jobs = await Job.find(q).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json(err);
  }
};



exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json("Job not found");

    if (job.status !== "open") return res.status(400).json("Job not open");

    const already = job.applicants.some(a => a.toString() === req.user.id);
    if (already) return res.status(400).json("Already applied");

    job.applicants.push(req.user.id);
    await job.save();
    res.json("Applied");
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.acceptWorker = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json("Job not found");

    if (job.clientId.toString() !== req.user.id)
      return res.status(403).json("Not allowed");

    job.workerId = req.body.workerId;
    job.status = "assigned";
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json(err);
  }
};
exports.acceptJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    // only open jobs can be accepted
    if (job.status !== "open") return res.status(400).json({ msg: "Job not open" });

    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ msg: "User not found" });

    if (me.role !== "partner") return res.status(403).json({ msg: "Only partner can accept" });

    job.status = "assigned";
    job.partnerId = me._id;
    job.partnerName = me.name;

    await job.save();
    res.json({ msg: "Accepted", job });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    // Just mark rejected for this partner UI (simple MVP)
    // If you want per-partner rejection list later, we’ll add it.
    if (job.status !== "open") return res.status(400).json({ msg: "Job not open" });

    job.status = "rejected";
    await job.save();

    res.json({ msg: "Rejected", job });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json("Job not found");

    if (job.clientId.toString() !== req.user.id)
      return res.status(403).json("Not allowed");

    if (!job.workerId) return res.status(400).json("No worker assigned");

    const client = await User.findById(job.clientId);
    const worker = await User.findById(job.workerId);

    if (client.balance < job.price)
      return res.status(400).json({ msg: "Not enough balance" });

    client.balance -= job.price;
    worker.balance += job.price;

    await client.save();
    await worker.save();

    job.status = "completed";
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json(err);
  }
};
