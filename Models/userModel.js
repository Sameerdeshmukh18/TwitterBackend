const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please add the name"],
    },
    username: {
      type: String,
      required: [true, "please add the username"],
      unique: [true, "The email is already registered"],
    },
    email: {
      type: String,
      required: [true, "please add the email address"],
      unique: [true, "The email is already registered"],
    },
    dob: {
      type: Date,
      required: [true, "please add the date of birth"],
    },
    bio: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [false],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
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

module.exports = mongoose.model("User", userSchema);
