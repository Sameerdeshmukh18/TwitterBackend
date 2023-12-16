const expressAsyncHandler = require("express-async-handler");
const Tweet = require("../Models/tweetModel");
const User = require("../Models/userModel");

const checkAuth = (context) => {
  const user = context.user;
  if (!user) {
    return false;
  } else {
    return true;
  }
};

//resolver
//@route Get
const getTweet_g = async (_, { tweet_id }, context) => {
  if (checkAuth(context)) {
    const tweet = await Tweet.findById(tweet_id);
    if (tweet) {
      return tweet;
    } else {
      throw new Error("Couldn't find tweet");
    }
  } else {
    throw new Error("User not authorized");
  }
};

//resolver
//@route Get
const getLikedBy = async (tweet, _, context) => {
  return tweet.liked_by.map((user_id) => User.findById(user_id));
};

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
//resolver
const getMyTweets_g = async (_, { user_id }, context) => {
  if (checkAuth(context)) {
    const myTweets = await Tweet.find({ user_id: context.user.id });
    if (!myTweets) {
      throw new Error("cannot find any tweet");
    }

    return myTweets;
  } else {
    throw new Error("User not authorized");
  }
};

//@desc create new tweet
//@route POST /api/tweets
//@access private

const createTweet = expressAsyncHandler(async (req, res) => {
  console.log("Creating tweet");
  const { tweet } = req.body;

  const user = await User.findOne({ _id: req.user.id });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (!tweet) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  } else {
    console.log(tweet);
    const newTweet = await Tweet.create({
      name: user.name,
      username: user.username,
      isVerified: user.isVerified,
      user_id: req.user.id,
      tweet_text: tweet,
    });
    console.log(newTweet);
    res.status(201).json({ tweet: newTweet });
  }
});
//resolver
const createTweet_g = async (_, { tweet }, context) => {
  if (checkAuth(context)) {
    const newTweet = await Tweet.create({
      user_id: context.user.id,
      tweet_text: tweet,
    });
    console.log(newTweet);
    return newTweet;
  } else {
    throw new Error("User not authorized");
  }
};

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
//resolver
const updateTweet_g = async (_, { tweet_id, tweet_text }, context) => {
  if (checkAuth(context)) {
    const tweet = await Tweet.findById(tweet_id);

    if (!tweet) {
      throw new Error("Tweet does not exist!");
    }
    if (tweet.user_id.toString() != context.user.id) {
      throw new Error(
        "user does not have permission to update other users tweet!"
      );
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(tweet_id, {
      tweet_text: tweet_text,
    });
    return updatedTweet;
  } else {
    throw new Error("User not authorized");
  }
};

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
//resolver
const likeTweet_g = async (_, { tweet_id }, context) => {
  if (checkAuth(context)) {
    const tweet = await Tweet.findById(tweet_id);
    if (!tweet) {
      throw new Error("Tweet does not exist!");
    } else {
      const t = await Tweet.findById(tweet_id);

      if (!t.liked_by.includes(context.user.id)) {
        const LikedTweet = await Tweet.findByIdAndUpdate(tweet_id, {
          $push: { liked_by: context.user.id },
        });
        return LikedTweet;
      } else {
        throw new Error("User already liked");
      }
    }
  } else {
    throw new Error("User not authorized");
  }
};

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
//resolver
const disLikeTweet_g = async (_, { tweet_id }, context) => {
  if (checkAuth(context)) {
    const tweet = await Tweet.findById(tweet_id);
    if (!tweet) {
      throw new Error("Tweet does not exist!");
    } else {
      const t = await Tweet.findById(tweet_id);

      if (t.liked_by.includes(context.user.id)) {
        const dislikedTweet = await Tweet.findByIdAndUpdate(tweet_id, {
          $pull: { liked_by: context.user.id },
        });
        return dislikedTweet;
      } else {
        throw new Error("User didnt liked the tweet");
      }
    }
  } else {
    throw new Error("User not authorized");
  }
};

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
  getTweet_g,
  createTweet,
  createTweet_g,
  getMyTweets,
  getMyTweets_g,
  deleteTweet,
  updateTweet,
  updateTweet_g,
  likeTweet,
  likeTweet_g,
  getLikedBy,
  disLikeTweet,
  disLikeTweet_g,
  shareTweet,
  unShareTweet,
  homeTimeline,
  userTimeline,
};
