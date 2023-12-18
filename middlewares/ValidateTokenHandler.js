const jwt = require("jsonwebtoken");

const contextMiddleware = async ({ req, res }) => {
  const token = req.headers.authorization || req.headers.Authorization || "";

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

module.exports = { contextMiddleware };
