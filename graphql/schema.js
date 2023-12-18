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

  type Token {
    token: String!
  }

  type Tweet {
    _id: ID!
    user_id: ID!
    user: User!
    tweet_text: String!
    liked_by: [User]
    comments: [Comment]
  }

  type Comment {
    _id: ID!
    user_id: ID!
    user: User!
    tweet_id: ID!
    comment_text: String!
    liked_by: [User]
  }

  type Query {
    getUserById(user_id: ID!): User
    getTweetById(tweet_id: ID!): Tweet
    getMyTweets: [Tweet]
    checkUsername(username: String!): Boolean
    homeTimeline: [Tweet]
    userTimeline: [Tweet]
  }

  type Mutation {
    register(name: String, username: String!, email: String!, dob: Date, password: String! ): User
    login(email: String!, password: String!): Token
    createTweet(tweet: String!): Tweet
    updateTweet(tweet_id: ID!, tweet_text: String!): Tweet
    deleteTweet(tweet_id: ID!): Tweet
    likeTweet(tweet_id: ID!): Tweet
    disLikeTweet(tweet_id: ID!): Tweet
    createComment(tweet_id: ID!, comment: String!): Comment
    updateComment(comment_id: ID!, comment: String!): Comment
    deleteComment(comment_id: ID!): Comment
    likeComment(comment_id: ID!): Comment
    disLikeComment(comment_id: ID!): Comment
  }
`;

module.exports = typeDefs;
