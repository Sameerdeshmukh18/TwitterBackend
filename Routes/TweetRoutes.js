const express = require('express');
const router = express.Router();
const {createTweet,getMyTweets, deleteTweet, updateTweet, likeTweet, disLikeTweet, shareTweet, unShareTweet, homeTimeline, userTimeline} = require("../Controllers/tweetController")
const validateToken = require('../middlewares/ValidateTokenHandler');


router.use(validateToken);
router.route('/').post(createTweet);

router.route('/:id').delete(deleteTweet).put(updateTweet);
router.route('/mytweets').get(getMyTweets);
router.route('/homeTimeline').get(homeTimeline);
router.route('/userTimeline/:id').get(userTimeline);
router.route('/likes/create/:id').put(likeTweet);
router.route('/likes/destroy/:id').put(disLikeTweet);
router.route('/shares/create/:id').put(shareTweet);
router.route('/shares/destroy/:id').put(unShareTweet);


module.exports = router;


