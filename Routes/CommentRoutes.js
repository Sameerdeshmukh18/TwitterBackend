const express = require('express');
const router = express.Router();
const {createComments, getComments, } = require("../Controllers/commentController");
const validateToken = require('../middlewares/ValidateTokenHandler');


router.use(validateToken);

router.route('/:id').post(createComments).get(getComments);
// router.route('/likes/create/:id').put(likeComment);
// router.route('/likes/destroy/:id').put(disLikeComment);


module.exports = router;


