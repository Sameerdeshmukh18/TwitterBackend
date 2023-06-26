const express = require('express');
const router = express.Router();
const {registerUser, loginUser, currentUser} = require('../Controllers/userController');
const validateToken = require('../middlewares/ValidateTokenHandler');


router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/current",validateToken,currentUser);


module.exports = router;
