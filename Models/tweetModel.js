const mongoose = require("mongoose");
const User = require("../Models/userModel");

const tweetSchema = mongoose.Schema({
    username:{
        type: String,
        require: true,
        //ref: "User",
        required: [true, "username is required"]
  
    },
    name:{
        type: String,
        require: true,
        //ref: "User",
        required: [true, "name is required"]
  
    },
    isVerified:{
        type: Boolean,
        require: true,
        ref: "User",
        required: [true, "isVerified is required"]
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "User",
        required: [true, "user_id is required"]
    },
    tweet_text:{
        type: String,
        required: [true, "please add the tweet text"]
    },
    liked_by: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
    ],
    shared_by: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
},
{
timestamps: true,
}
)

module.exports = mongoose.model("Tweet",tweetSchema);