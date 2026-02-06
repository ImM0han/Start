const router = require("express").Router();
const {register,login} = require("../controllers/authController");

router.post("/register",register);
router.post("/login",login);
router.get("/me",auth,async(req,res)=>{
 const user = await User.findById(req.user.id);
 res.json(user);
});


module.exports = router;
