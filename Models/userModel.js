const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "please add the username"],
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
  password: {
    type: String,
    required: [true, "please enter the password"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
      
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  ],
},
{
    timestamp: true

}
);

module.exports = mongoose.model("User",userSchema)
