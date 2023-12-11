const express = require('express');
const router = express.Router();
const {registerUser, loginUser, currentUser, userDetails, editBio, checkUsername} = require('../Controllers/userController');
const validateToken = require('../middlewares/ValidateTokenHandler');


router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/current",validateToken,currentUser);
router.put("/editBio",validateToken, editBio);
router.get("/:id",userDetails);
router.get("/checkUsername/:username",checkUsername)


module.exports = router;
