// graphql/resolvers.js
const { GraphQLScalarType, Kind } = require("graphql");
const {
  registerUser_g,
  loginUser_g,
  userDetails_g,
  getUser,
} = require("../Controllers/userController");

const {
  createTweet_g,
  getTweet_g,
  getMyTweets_g,
  updateTweet_g,
  likeTweet_g,
  disLikeTweet_g,
  getLikedBy,
} = require("../Controllers/tweetController");

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime(); // Convert outgoing Date to integer for JSON
    }
    throw Error("GraphQL Date Scalar serializer expected a `Date` object");
  },
  parseValue(value) {
    if (typeof value === "number") {
      return new Date(value); // Convert incoming integer to Date
    }
    throw new Error("GraphQL Date Scalar parser expected a `number`");
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      // Convert hard-coded AST string to integer and then to Date
      return new Date(parseInt(ast.value, 10));
    }
    // Invalid hard-coded value (not an integer)
    return null;
  },
});

const resolvers = {
  Date: dateScalar,
  Tweet: {
    user: (tweet, _, context) => getUser(tweet, _, context),
    liked_by: (tweet, _, context) => getLikedBy(tweet, _, context),
  },
  Query: {
    getUserById: userDetails_g,
    getTweetById: getTweet_g,
    getMyTweets: getMyTweets_g,
  },
  Mutation: {
    register: registerUser_g,
    login: loginUser_g,
    createTweet: createTweet_g,
    updateTweet: updateTweet_g,
    likeTweet: likeTweet_g,
    disLikeTweet: disLikeTweet_g,
  },
};

module.exports = resolvers;
