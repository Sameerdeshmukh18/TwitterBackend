const expressAsyncHandler = require("express-async-handler");
const Tweet = require("../Models/tweetModel");
const User = require("../Models/userModel");
const Comment = require("../Models/commentModel");

const checkAuth = (context) => {
  const user = context.user;
  if (!user) {
    return false;
  } else {
    return true;
  }
};

//resolver
const getComments_g = async (tweet, _, context) => {
  return tweet.comments.map((comment_id) => Comment.findById(comment_id));
};

//resolver
const createComment_g = async (_, { tweet_id, comment }, context) => {
  if (checkAuth(context)) {
    if (comment) {
      const tweet = await Tweet.findOne({ _id: tweet_id });
      if (tweet) {
        const newComment = await Comment.create({
          user_id: context.user.id,
          comment_text: comment,
          tweet_id: tweet_id,
        });
        await Tweet.findByIdAndUpdate(tweet_id, {
          $push: { comments: newComment._id },
        });
        return newComment;
      } else {
        throw new Error("Tweet not found");
      }
    } else {
      throw new Error("Data required in comment");
    }
  } else {
    throw new Error("User not authorized");
  }
};

const deleteComment_g = async (_, { comment_id }, context) => {
  if (checkAuth(context)) {
    const comment = await Comment.findById(comment_id);
    if (comment && comment.user_id == context.user.id) {
      await Comment.deleteOne({ _id: comment_id });
      await Tweet.findByIdAndUpdate(comment.tweet_id, {
        $pull: { comments: comment_id },
      });
      return comment;
    } else {
      throw new Error("Cannot delete a comment");
    }
  } else {
    throw new Error("User not authorized");
  }
};

const updateComment_g = async (_, { comment_id, comment }, context) => {
  if (checkAuth(context)) {
    const c = await Comment.findById(comment_id);
    if (c && c.user_id === context.user.id) {
      const updatedComment = await Tweet.findByIdAndUpdate(comment_id, {
        comment_text: comment,
      });
      return updatedComment;
    } else {
      throw new Error("Cannot update comment");
    }
  } else {
    throw new Error("User not authorized");
  }
};

const likeComment_g = async (_, { comment_id }, context) => {
  if (checkAuth(context)) {
    const comment = await Comment.findById(comment_id);
    if (comment) {
      await Comment.findByIdAndUpdate(comment_id, {
        $push: { liked_by: context.user.id },
      });
      const c = await Comment.findById(comment_id);
      return c;
    }
  } else {
    throw new Error("User not authorized");
  }
};

const disLikeComment_g = async (_, { comment_id }, context) => {
  if (checkAuth(context)) {
    const comment = await Comment.findById(comment_id);
    if (comment) {
      await Comment.findByIdAndUpdate(comment_id, {
        $pull: { liked_by: context.user.id },
      });
      const c = await Comment.findById(comment_id);
      return c;
    }
  } else {
    throw new Error("User not authorized");
  }
};

module.exports = {
  getComments_g,
  createComment_g,
  deleteComment_g,
  updateComment_g,
  likeComment_g,
  disLikeComment_g,
};
