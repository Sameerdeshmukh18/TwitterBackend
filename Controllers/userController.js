const expressAsyncHandler = require("express-async-handler");
const S3Client = require("../Clients/S3Client")
const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const { bucketNames } = require('../Constants');

const checkAuth = (context) => {
  return context.user ? true : false;
};

const me = async (_, __, context) => {
  if (checkAuth(context)) {
    const user = await User.findById(context.user.id);
    if (user) {
      return user;
    } else {
      throw new Error("User not found");
    }
  } else {
    throw new Error("User not authorized");
  }
};

const authenticate_g = async(_, __, context) => {
  return checkAuth(context);
}

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
  if(newUser){
    console.log(`user created successfully ${newUser}`);
    const token = jwt.sign(
      {
        user: {
          name: newUser.name,
          username: newUser.username,
          id: newUser.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    return { token };

  }else {
    throw new Error("Something went wrong!");
  }
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
      return false;
    } else {
      return true;
    }
  } else {
    throw new Error("Please provide username");
  }
};

const getProfilePhotoPresignedUploadURL_g = async (_, { file_name, file_type }) => {
  console.log(`File Name: ${file_name}`)
  console.log(`File Type: ${file_type}`)

  // Get actual Id of the user some hash I guess :)
  
  const s3Client = new S3Client();
  const bucketName = bucketNames.USER_PROFILE_PHOTO_BUCKET
  const uploadURL = s3Client.getPresignedUrl(bucketName, file_name, file_type)
  return { uploadURL, file_name, file_type }
}

module.exports = {
  me,
  authenticate_g,
  registerUser_g,
  loginUser_g,
  userDetails_g,
  getUser,
  editBio,
  checkUsername,
  getProfilePhotoPresignedUploadURL_g
};
