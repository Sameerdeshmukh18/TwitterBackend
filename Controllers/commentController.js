const expressAsyncHandler = require("express-async-handler");
const Tweet = require("../Models/tweetModel");
const User = require("../Models/userModel");
const Comment = require("../Models/commentModel");
const {userDetails} = require('../Controllers/userController');
 

//@desc get all tweets done by me
//@route GET /api/tweets/mytweets
//@access private

const getComments = expressAsyncHandler(async (req, res) => {
  
  const tweet_id = req.params.id;
  const comments = Comment.find({'tweet_id': tweet_id})
  res.status(200).json(comments);
});

//@desc create new tweet
//@route POST /api/tweets
//@access private

const createComment = expressAsyncHandler(async (req, res) => {
  const { comment } = req.body;
  const tweet_id = req.params.id;
  const user = await User.findOne({ _id: req.user.id });
  if(!user){
    res.status(404);
    throw new Error("User not found");
  }
  if (!comment) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  } else {
    const newComment = await Comment.create({
      name: user.name,
      username: user.username,
      isVerified: user.isVerified,
      user_id: req.user.id,
      comment_text: tweet,
      tweet_id: tweet_id
    });
    console.log(newComment);
    res.status(201).json({ comment: newComment});
  }
});

//@desc delete tweet
//@route DELETE /api/tweets/:id
//@access private
// const deleteComment = expressAsyncHandler(async (req, res) => {
//   const tweet = await Tweet.findById(req.params.id);

//   if (!tweet) {
//     res.status(404);
//     throw new Error("Tweet does not exist!");
//   }
//   if (tweet.user_id.toString() != req.user.id) {
//     res.status(403);
//     throw new Error(
//       "user does not have permission to delete other users tweet!"
//     );
//   }
//   await Tweet.deleteOne({ _id: req.params.id });
//   res.status(200).json(tweet);
// });

// //@desc update tweet
// //@route PUT /api/tweets/:id
// //@access private
// const updateComment = expressAsyncHandler(async (req, res) => {
//   const tweet = await Tweet.findById(req.params.id);
//   const { tweet_text } = req.body;

//   if (!tweet) {
//     res.status(404);
//     throw new Error("Tweet does not exist!");
//   }
//   if (tweet.user_id.toString() != req.user.id) {
//     res.status(403);
//     throw new Error(
//       "user does not have permission to update other users tweet!"
//     );
//   }
//   const updatedTweet = await Tweet.findByIdAndUpdate(req.params.id, {
//     tweet_text: tweet_text,
//   });
//   res.status(200).json(updatedTweet);
// });

// //@desc like a Tweet
// //@route PUT /api/tweets/likes/create/:id
// //@access private

// const likeComment = expressAsyncHandler(async (req, res) => {
//   const tweet = await Tweet.findById(req.params.id);

//   if (!tweet) {
//     res.status(404);
//     throw new Error("Tweet does not exist!");
//   }
//   const LikedTweet = await Tweet.findByIdAndUpdate(req.params.id, {
//     $push: { liked_by: req.user.id },
//   });
//   res.status(200).json(LikedTweet);
// });

// //@desc takeback your like from a Tweet
// //@route PUT /api/tweets/likes/destroy/:id
// //@access private

// const disLikeComment = expressAsyncHandler(async (req, res) => {
//   const tweet = await Tweet.findById(req.params.id);

//   if (!tweet) {
//     res.status(404);
//     throw new Error("Tweet does not exist!");
//   }
//   const dislikedTweet = await Tweet.findByIdAndUpdate(req.params.id, {
//     $pull: { liked_by: req.user.id },
//   });
//   res.status(200).json(dislikedTweet);
// });

//@desc share a Tweet
//@route PUT /api/tweets/shares/create/:id
//@access private

module.exports = {
  getComments,
  createComment,
  // updateComment,
  // likeComment,
  // disLikeComment,
  // deleteComment
};
