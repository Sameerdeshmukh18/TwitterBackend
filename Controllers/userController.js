const expressAsyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const checkAuth = (context) => {
  const user = context.user;
  console.log("User", user);
  if (!user) {
    return false;
  } else {
    return true;
  }
};

//@desc register a user
//@route POST /api/users/register
//@access public

const registerUser = expressAsyncHandler(async (req, res) => {
  const { username, email, password, dob, name } = req.body;

  if (!email || !username || !password || !dob || !name) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("user already registered!");
  }
  // Hash password

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("the hashed password is", hashedPassword);

  const newUser = await User.create({
    name,
    username,
    email,
    dob,
    password: hashedPassword,
  });
  console.log(`user created successfully" ${newUser}`);
  if (newUser) {
    const accessToken = jwt.sign(
      {
        user: {
          name: name,
          username: username,
          id: newUser._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    res
      .status(201)
      .json({ _id: newUser._id, email: newUser.email, authToken: accessToken });
  } else {
    res.status(400);
    throw new Error("user data is not valid!");
  }
});
//resolver
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

//@desc Login user
//@route POST /api/users/login
//@access public

const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const user = await User.findOne({ email });

  // compare password and hashed password

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
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
    res.status(200).json({ accessToken });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials!");
  }
});
//resolver
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
    return token;
  } else {
    throw new Error("Invalid Credentials!");
  }
};

//@desc current user info
//@route GET /api/users/current
//@access private
const currentUser = expressAsyncHandler(async (req, res) => {
  res.json(req.user);
});

//@desc get another users informaion
//@route GET /api/users/:id
//@access public

const userDetails = expressAsyncHandler(async (req, res) => {
  const user_id = req.params.id;

  if (!user_id) {
    res.status(400);
    throw new Error("Invalid User Id");
  }
  const user = await User.findOne({ _id: user_id });
  if (!user) {
    res.status(400);
    throw new Error("Invalid User Id");
  }
  res.status(200).json({
    name: user.name,
    username: user.username,
    isVerified: user.isVerified,
  });
});
//resolver
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

//@desc edit bio
//@route PUT /api/users/editBio
//@access private

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

//@desc check for username's availability
//@route GET /api/users/checkUsername/:username
//@access public

const checkUsername = expressAsyncHandler(async (req, res) => {
  const username = req.params.username;
  if (!username) {
    res.status(400);
    throw new Error("Please provide username");
  }
  const usernameAvailable = await User.findOne({ username });
  if (usernameAvailable) {
    res.status(400);
    throw new Error("Username is already taken!");
  }

  res.status(200).send({ availability: "true" });
});

module.exports = {
  registerUser,
  registerUser_g,
  loginUser,
  loginUser_g,
  currentUser,
  userDetails,
  userDetails_g,
  getUser,
  editBio,
  checkUsername,
};
