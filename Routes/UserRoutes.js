const express = require('express');
const router = express.Router();
const {registerUser, loginUser, currentUser, userDetails, editBio} = require('../Controllers/userController');
const validateToken = require('../middlewares/ValidateTokenHandler');


router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/current",validateToken,currentUser);
router.get("/:id",userDetails);
router.put("/editBio",validateToken, editBio);


module.exports = router;
