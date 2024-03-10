const expressAsyncHandler = require("express-async-handler");
const Tweet = require("../Models/tweetModel");
const User = require("../Models/userModel");
const { default: mongoose } = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const checkAuth = (context) => {
  const user = context.user;
  console.log(user);
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

const getMyTweets_g = async (_, { first, after }, context) => {
  if (checkAuth(context)) {
    const user = await User.findById(context.user.id);
    if (user) {

      // Set the initial query conditions
      const conditions = { user_id: user.id };
      if (after) {
        conditions._id = { $lt: new ObjectId(after) };
      }

      const tweets = await Tweet.find(conditions).sort({
        createdAt: -1,
      }).limit(first);
      const endCursor = tweets.length>0 ? tweets[tweets.length-1]._id :null;
      return{
        tweets: tweets,
        endCursor: endCursor
      }
    } else {
      throw new Error("No user found");
    }
  } else {
    throw new Error("User not authorized");
  }
};

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

const deleteTweet_g = async (_, { tweet_id }, context) => {
  if (checkAuth(context)) {
    const tweet = await Tweet.findById(tweet_id);
    if (tweet && tweet.user_id == context.user.id) {
      await Tweet.deleteOne({ _id: Tweet_id });
      return tweet;
    } else {
      throw new Error("Cannot delete a comment");
    }
  } else {
    throw new Error("User not authorized");
  }
};

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

const likeTweet_g = async (_, { tweet_id }, context) => {
  if (checkAuth(context)) {
    const tweet = await Tweet.findById(tweet_id);
    if (!tweet) {
      throw new Error("Tweet does not exist!");
    } else {
      const t = await Tweet.findById(tweet_id);

      if (!t.liked_by.includes(context.user.id)) {
        await Tweet.findByIdAndUpdate(tweet_id, {
          $push: { liked_by: context.user.id },
        });
        const t_2 = await Tweet.findById(tweet_id);
        return t_2;
      } else {
        throw new Error("User already liked");
      }
    }
  } else {
    throw new Error("User not authorized");
  }
};

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
        const t_2 = await Tweet.findById(tweet_id);
        return t_2;
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

//resolver
const homeTimeline_g = async (_, { first, after }, context) => {
  if (checkAuth(context)) {
    const user = await User.findById(context.user.id);
    if (user) {
      const { following } = user;

      // Set the initial query conditions
      const conditions = { user_id: { $in: following } };
      if (after) {
        conditions._id = { $lt: new ObjectId(after) };
      }
      // Query for the tweets
      const tweets = await Tweet.find(conditions).sort({ createdAt: -1 }).limit(first);
      const endCursor = tweets.length>0 ? tweets[tweets.length-1]._id : "END";
      return{
        tweets: tweets,
        endCursor: endCursor
      } 
    } else {
      throw new Error("No user found");
    }
  } else {
    throw new Error("User not authorized");
  }
};

const userTimeline_g = async (_, { user_id, first, after }, context) => {
  if (checkAuth(context)) {
    const user = await User.findById(user_id);
    if (user) {

      // Set the initial query conditions
      const conditions = { user_id: user_id };
      if (after) {
        conditions._id = { $lt: new ObjectId(after) };
      }

      const tweets = await Tweet.find(conditions).sort({
        createdAt: -1,
      }).limit(first);
      const endCursor = tweets.length>0 ? tweets[tweets.length-1]._id :null;
      return{
        tweets: tweets,
        endCursor: endCursor
      } 
    } else {
      throw new Error("No user found");
    }
  } else {
    throw new Error("User not authorized");
  }
};

module.exports = {
  getTweet_g,
  createTweet_g,
  getMyTweets_g,
  deleteTweet_g,
  updateTweet_g,
  likeTweet_g,
  getLikedBy,
  disLikeTweet_g,
  shareTweet,
  unShareTweet,
  homeTimeline_g,
  userTimeline_g,
};
