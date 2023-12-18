const expressAsyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const checkAuth = (context) => {
  const user = context.user;

  if (!user) {
    return false;
  } else {
    return true;
  }
};

const registerUser_g = async (_, { name, username, email, password, dob }) => {
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    throw new Error("user already registered!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    username,
    email,
    password: hashedPassword,
    dob,
  });
  console.log(`user created successfully" ${newUser}`);

  return newUser;
};

const loginUser_g = async (_, { email, password }) => {
  if (!email || !password) {
    throw new Error("All fields are mandatory!");
  }

  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      {
        user: {
          name: user.name,
          username: user.username,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    console.log("successful login");
    return { token };
  } else {
    throw new Error("Invalid Credentials!");
  }
};

const userDetails_g = async (_, { user_id }, context) => {
  // Check authentication
  if (checkAuth(context)) {
    try {
      const user = await User.findById(user_id);
      return user;
    } catch (error) {
      throw new Error("Error fetching user by ID");
    }
  } else {
    throw new Error("User not authorized");
  }
};

//Tweet and Comment user resolver
const getUser = async (entity, _, context) => {
  if (checkAuth(context)) {
    try {
      const user = await User.findById(entity.user_id);
      return user;
    } catch (error) {
      throw new Error("Error fetching user by ID");
    }
  } else {
    throw new Error("User not authorized");
  }
};

const editBio = expressAsyncHandler(async (req, res) => {
  const { bio } = req.body;
  if (!bio) {
    res.status(400);
    throw new Error("Please enter bio");
  }
  const user = await User.findOne({ _id: req.user.id });
  if (!user) {
    res.status(400);
    throw new Error("Invalid User Id");
  }

  const editedBio = await User.findByIdAndUpdate(
    req.user.id,
    { bio: bio },
    { new: true }
  );

  if (editedBio) {
    res.status(201).json({ bio: editedBio.bio });
  }
});

const checkUsername = async (_, { username }) => {
  if (username) {
    const usernameAvailable = await User.findOne({ username });
    if (usernameAvailable) {
      return true;
    } else {
      return false;
    }
  } else {
    throw new Error("Please provide username");
  }
};

module.exports = {
  registerUser_g,
  loginUser_g,
  userDetails_g,
  getUser,
  editBio,
  checkUsername,
};
