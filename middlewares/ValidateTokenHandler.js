const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = expressAsyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    res.status(401);
    throw new Error("User is not authorized or token is missing!");
  }
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("User is not authorized!");
      }
      req.user = decoded.user;
      next();
    });
    if (!token) {
      res.status(401);
      throw new Error("User is not authorized or token is missing!");
    }
  }
});

const contextMiddleware = async ({ req, res }) => {
  const token = req.headers.authorization || req.headers.Authorization || "";

  // Try to retrieve a user with the token
  try {
    if (token) {
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }
    return null;
  } catch (error) {
    console.log("Error ", error);
    return null;
  }
};

module.exports = validateToken;
