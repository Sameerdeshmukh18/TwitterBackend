// graphql/resolvers.js
const {
  registerUser_g,
  loginUser_g,
  userDetails_g,
} = require("../Controllers/userController");

const resolvers = {
  Query: {
    getUserById: userDetails_g,
  },
  Mutation: {
    register: registerUser_g,
    login: loginUser_g,
  },
};

module.exports = resolvers;
