const expressAsyncHandler = require("express-async-handler");
const Tweet = require("../Models/tweetModel");
const User = require("../Models/userModel");
const Comment = require("../Models/commentModel");
 

//@desc get all comments of a tweet
//@route GET /api/comments/:id
//@access private

const getComments = expressAsyncHandler(async (req, res) => {
  
  const tweet_id = req.params.id;
  if(!tweet_id){
    res.status(400);
    throw new Error("Invalid Tweet Id!");
  }
  let pageSize = req.query.pageSize;
  let page = req.query.page;
  if (!pageSize) {
    pageSize = 20;
  }
  if (!page) {
    page = 1;
  }

  const comments = await Comment.find({tweet_id: tweet_id})
  .sort({ createdAt: -1 })
  .limit(pageSize * page)
  .skip((page - 1) * pageSize)
  .exec();

  
  if(!comments){
    res.status(404);
    throw new Error("Comments not found");

  }
  res.status(200).json(comments);
});

//@desc create new Comment
//@route POST /api/comments/:id
//@access private

const createComment = expressAsyncHandler(async (req, res) => {
  const { comment } = req.body;
  const tweet_id = req.params.id;
  const tweet = await Tweet.findOne({_id: req.params.id})
  const user = await User.findOne({ _id: req.user.id });
  if(!tweet){
    res.status(404);
    throw new Error("Tweet not found");

  }
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
      comment_text: comment,
      tweet_id: tweet_id
    });
    console.log(newComment);
    res.status(201).json({ comment: newComment});
  }
});

// @desc delete comment
// @route DELETE /api/comments/:id
// @access private

const deleteComment = expressAsyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment does not exist!");
  }
  if (comment.user_id.toString() != req.user.id) {
    res.status(403);
    throw new Error(
      "user does not have permission to delete other users comment!"
    );
  }
  await Comment.deleteOne({ _id: req.params.id });
  res.status(200).json(comment);
});

// //@desc update comment
// //@route PUT /api/comment/:id
// //@access private
const updateComment = expressAsyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  const { comment_text } = req.body;

  if (!comment) {
    res.status(404);
    throw new Error("comment does not exist!");
  }
  if (comment.user_id.toString() != req.user.id) {
    res.status(403);
    throw new Error(
      "user does not have permission to update other users comment!"
    );
  }
  const updatedComment = await Tweet.findByIdAndUpdate(req.params.id, {
    comment_text: comment_text,
  });
  res.status(200).json(updatedComment);
});

// //@desc like a comment
// //@route PUT /api/comment/likes/create/:id
// //@access private

const likeComment = expressAsyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("comment does not exist!");
  }
  const LikedComment = await Comment.findByIdAndUpdate(req.params.id, {
    $push: { liked_by: req.user.id },
  });
  res.status(200).json(LikedComment);
});

// //@desc takeback your like from a comment
// //@route PUT /api/comments/likes/destroy/:id
// //@access private

const disLikeComment = expressAsyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("comment does not exist!");
  }
  const dislikedComment = await Comment.findByIdAndUpdate(req.params.id, {
    $pull: { liked_by: req.user.id },
  });
  res.status(200).json(dislikedComment);
});

// @desc share a Tweet
// @route PUT /api/tweets/shares/create/:id
// @access private

module.exports = {
  getComments,
  createComment,
  updateComment,
  likeComment,
  disLikeComment,
  deleteComment
};
