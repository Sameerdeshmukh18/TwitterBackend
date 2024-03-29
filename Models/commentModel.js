const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
      required: [true, "user_id is required"],
    },
    tweet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
      required: [true, "please add the tweet text"],
    },
    comment_text: {
      type: String,
      required: [true, "please add the tweet text"],
    },
    liked_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    shared_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
