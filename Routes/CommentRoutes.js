const express = require('express');
const router = express.Router();
const {createComment, getComments,deleteComment, updateComment, likeComment, disLikeComment } = require("../Controllers/commentController");
const validateToken = require('../middlewares/ValidateTokenHandler');


router.use(validateToken);

router.route('/:id').post(createComment).get(getComments).delete(deleteComment).put(updateComment);
router.route('/likes/create/:id').put(likeComment);
router.route('/likes/destroy/:id').put(disLikeComment);


module.exports = router;


