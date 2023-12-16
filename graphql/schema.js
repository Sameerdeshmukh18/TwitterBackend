const typeDefs = `
  scalar Date

  type User {
    _id: ID!
    name: String
    username: String!
    email: String
    dob: Date
    bio: String
    password: String!
    isVertified: Boolean
    followers: [User]
    following: [User]
  }

  type Tweet {
    _id: ID!
    user_id: ID!
    user: User!
    tweet_text: String!
    liked_by: [User]
  }

  type Query {
    getUserById(user_id: ID!): User
    getTweetById(tweet_id: ID!): Tweet
    getMyTweets: [Tweet]
  }

  type Mutation {
    register(name: String, username: String!, email: String!, dob: Date, password: String! ): User
    login(email: String!, password: String!): String!
    createTweet(tweet: String!): Tweet
    updateTweet(tweet_id: ID!, tweet_text: String!): Tweet
    likeTweet(tweet_id: ID!): Tweet
    disLikeTweet(tweet_id: ID!): Tweet
  }
`;

module.exports = typeDefs;
