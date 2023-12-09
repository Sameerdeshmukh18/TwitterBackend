const expressAsyncHandler = require("express-async-handler");
const Tweet = require("../Models/tweetModel");
const User = require("../Models/userModel");

//@desc get all tweets done by me
//@route GET /api/tweets/mytweets
//@access private

const getMyTweets = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("user not found");
  }
  let pageSize = req.query.pageSize;
  let page = req.query.page;
  if (!pageSize) {
    pageSize = 20;
  }
  if (!page) {
    page = 1;
  }

  const myTweets = await Tweet.find({ user_id: req.user.id })
    .sort({ createdAt: -1 })
    .limit(pageSize * page)
    .skip((page - 1) * pageSize)
    .exec();
  if (!myTweets) {
    res.status(404);
    throw new Error("cannot find any tweet");
  }

  res.status(200).json(myTweets);
});

//@desc create new tweet
//@route POST /api/tweets
//@access private

const createTweet = expressAsyncHandler(async (req, res) => {
  const { tweet } = req.body;
  if (!tweet) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  } else {
    const newTweet = Tweet.create({
      user_id: req.user.id,
      tweet_text: tweet,
    });
    res.status(201).json({ tweet_text: newTweet.tweet_text });
  }
});

//@desc delete tweet
//@route DELETE /api/tweets/:id
//@access private
const deleteTweet = expressAsyncHandler(async (req, res) => {
  const tweet = await Tweet.findById(req.params.id);

  if (!tweet) {
    res.status(404);
    throw new Error("Tweet does not exist!");
  }
  if (tweet.user_id.toString() != req.user.id) {
    res.status(403);
    throw new Error(
      "user does not have permission to delete other users tweet!"
    );
  }
  await Tweet.deleteOne({ _id: req.params.id });
  res.status(200).json(tweet);
});

//@desc update tweet
//@route PUT /api/tweets/:id
//@access private
const updateTweet = expressAsyncHandler(async (req, res) => {
  const tweet = await Tweet.findById(req.params.id);
  const { tweet_text } = req.body;

  if (!tweet) {
    res.status(404);
    throw new Error("Tweet does not exist!");
  }
  if (tweet.user_id.toString() != req.user.id) {
    res.status(403);
    throw new Error(
      "user does not have permission to update other users tweet!"
    );
  }
  const updatedTweet = await Tweet.findByIdAndUpdate(req.params.id, {
    tweet_text: tweet_text,
  });
  res.status(200).json(updatedTweet);
});

//@desc like a Tweet
//@route PUT /api/tweets/likes/create/:id
//@access private

const likeTweet = expressAsyncHandler(async (req, res) => {
  const tweet = await Tweet.findById(req.params.id);

  if (!tweet) {
    res.status(404);
    throw new Error("Tweet does not exist!");
  }
  const LikedTweet = await Tweet.findByIdAndUpdate(req.params.id, {
    $push: { liked_by: req.user.id },
  });
  res.status(200).json(LikedTweet);
});

//@desc takeback your like from a Tweet
//@route PUT /api/tweets/likes/destroy/:id
//@access private

const disLikeTweet = expressAsyncHandler(async (req, res) => {
  const tweet = await Tweet.findById(req.params.id);

  if (!tweet) {
    res.status(404);
    throw new Error("Tweet does not exist!");
  }
  const dislikedTweet = await Tweet.findByIdAndUpdate(req.params.id, {
    $pull: { liked_by: req.user.id },
  });
  res.status(200).json(dislikedTweet);
});

//@desc share a Tweet
//@route PUT /api/tweets/shares/create/:id
//@access private

const shareTweet = expressAsyncHandler(async (req, res) => {
  const tweet = await Tweet.findById(req.params.id);

  if (!tweet) {
    res.status(404);
    throw new Error("Tweet does not exist!");
  }
  if (tweet.user_id.toString() == req.user.id) {
    res.status(403);
    throw new Error("user cannot share his own tweet");
  }
  const sharedTweet = await Tweet.findByIdAndUpdate(req.params.id, {
    $push: { shared_by: req.user.id },
  });
  res.status(200).json(sharedTweet);
});

//@desc share a Tweet
//@route PUT /api/tweets/shares/destroy/:id
//@access private

const unShareTweet = expressAsyncHandler(async (req, res) => {
  const tweet = await Tweet.findById(req.params.id);

  if (!tweet) {
    res.status(404);
    throw new Error("Tweet does not exist!");
  }
  if (tweet.user_id.toString() == req.user.id) {
    res.status(403);
    throw new Error("user cannot unshare his own tweet");
  }

  const unSharedTweet = await Tweet.findByIdAndUpdate(req.params.id, {
    $pull: { shared_by: req.user.id },
  });
  res.status(200).json(unSharedTweet);
});

//@desc get home timeline
//@route GET /api/tweets/homeTimeline
//@access private

const homeTimeline = expressAsyncHandler(async (req, res) => {
  const curUser = await User.findById(req.user.id);
  if (!curUser) {
    res.status(404);
    throw new Error("user does not exist!");
  }
  const { following } = curUser;
  let pageSize = req.query.pageSize;
  let page = req.query.page;
  if (!pageSize) {
    pageSize = 20;
  }
  if (!page) {
    page = 1;
  }

  const tweets = await Tweet.find({ user_id: { $in: following } })
    .sort({ createdAt: -1 })
    .limit(pageSize * page)
    .skip((page - 1) * pageSize)
    .exec();
  res.status(200).json(tweets);
});

//@desc get user timeline
//@route GET /api/tweets/userTimeline/:id
//@access private

const userTimeline = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("user not found");
  }
  let pageSize = req.query.pageSize;
  let page = req.query.page;
  if (!pageSize) {
    pageSize = 20;
  }
  if (!page) {
    page = 1;
  }

  const tweets = await Tweet.find({ user_id: req.params.id })
    .sort({ createdAt: -1 })
    .limit(pageSize * page)
    .skip((page - 1) * pageSize)
    .exec();
  res.status(200).json(tweets);
});

module.exports = {
  createTweet,
  getMyTweets,
  deleteTweet,
  updateTweet,
  likeTweet,
  disLikeTweet,
  shareTweet,
  unShareTweet,
  homeTimeline,
  userTimeline,
};
