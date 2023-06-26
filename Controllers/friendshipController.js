const expressAsyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const { default: mongoose } = require("mongoose");

//@desc get all followers list
//@route GET /api/friendship/followers
//@access private

const getFollowers = expressAsyncHandler(async (req, res) => {
  const curUser = await User.findById(req.user.id);
  if (!curUser) {
    res.status(404);
    throw new Error("user does not exist!");
  }

  const { followers } = curUser;

  const followersList = await User.find({ _id: { $in: followers } });
  res.status(200).json(followersList);
});

//@desc follow another user
//@route PUT /api/friendship/followers/create/:id
//@access private

const followUser = expressAsyncHandler(async (req, res) => {
  const curUser = await User.findById(req.user.id);
  if (!curUser) {
    res.status(404);
    throw new Error("user not found");
  }
  const updateFollowers = await User.findByIdAndUpdate(req.params.id, {
    $push: { followers: req.user.id },
  });
  const updateFollowing = await User.findByIdAndUpdate(req.user.id, {
    $push: { following: req.params.id },
  });
  res.status(200).json(updateFollowing);
});

//@desc unfollow another user
//@route PUT /api/friendship/followers/destroy/:id
//@access private

const unFollowUser = expressAsyncHandler(async(req,res)=>{

  const curUser = await User.findById(req.user.id);
  if (!curUser) {
    res.status(404);
    throw new Error("user not found");
  }
  const updateUnFollower = await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user.id },
  });
  const updateUnFollowing = await User.findByIdAndUpdate(req.user.id, {
    $pull: { following: req.params.id },
  });
  res.status(200).json(updateUnFollowing);

})

module.exports = { getFollowers, followUser, unFollowUser };
