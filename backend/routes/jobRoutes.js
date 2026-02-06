const router = require("express").Router();
const {createJob,getJobs,applyJob,acceptWorker} = require("../controllers/jobController");
const auth = require("../middlewares/auth");

router.post("/",auth,createJob);
router.get("/",getJobs);

router.post("/:id/apply",auth,applyJob);
router.post("/:id/accept",auth,acceptWorker);
router.post("/:id/complete",auth,completeJob);

module.exports = router;
