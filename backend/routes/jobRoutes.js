const router = require("express").Router();
const auth = require("../middlewares/auth"); // check folder name: middleware or middlewares

const {
  getJobs,
  acceptJob,
  rejectJob
} = require("../controllers/jobController");

// Get jobs (with optional ?category=)
router.get("/", auth, getJobs);

// Accept job
router.put("/:id/accept", auth, acceptJob);

// Reject job
router.put("/:id/reject", auth, rejectJob);

module.exports = router;
