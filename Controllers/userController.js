const expressAsyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

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
  res
    .status(200)
    .json({
      name: user.name,
      username: user.username,
      isVerified: user.isVerified,
    });
});

module.exports = { registerUser, loginUser, currentUser, userDetails };
