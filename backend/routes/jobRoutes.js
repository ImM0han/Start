const router = require("express").Router();
const auth = require("../middlewares/auth.js");

const {
  getJobs,
  createJob,
  acceptJob,
  rejectJob,
  // added (won't break partner even if unused)
  getMyJobs,
} = require("../controllers/jobController");

// partner dashboard (existing)
router.get("/", auth, getJobs);

// partner actions (existing)
router.put("/:id/accept", auth, acceptJob);
router.put("/:id/reject", auth, rejectJob);

// client post job (existing in many setups; keep only if you had it before)
router.post("/", auth, createJob);

// client dashboard: my jobs (NEW, doesn’t affect partner)
if (getMyJobs) router.get("/my", auth, getMyJobs);

module.exports = router;
