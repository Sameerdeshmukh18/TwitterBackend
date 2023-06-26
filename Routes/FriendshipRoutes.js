const express = require('express');
const router = express.Router();
const {getFollowers, followUser, unFollowUser} = require('../Controllers/friendshipController')
const validateToken = require('../middlewares/ValidateTokenHandler');


router.use(validateToken);
router.route('/followers').get(getFollowers);
router.route('/followers/create/:id').put(followUser);
router.route('/followers/destroy/:id').put(unFollowUser);





module.exports = router;