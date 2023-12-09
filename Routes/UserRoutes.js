const express = require('express');
const router = express.Router();
const {registerUser, loginUser, currentUser, userDetails} = require('../Controllers/userController');
const validateToken = require('../middlewares/ValidateTokenHandler');


router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/current",validateToken,currentUser);
router.get("/userDetails/:id",validateToken,userDetails)


module.exports = router;
