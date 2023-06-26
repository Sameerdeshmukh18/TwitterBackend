const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "User",
        required: [true, "user id is required"]
  
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
},
{
timestamps: true,
}
)

module.exports = mongoose.model("Tweet",tweetSchema);