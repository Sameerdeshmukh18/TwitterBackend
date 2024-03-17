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
    isVerified: Boolean!
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
    createdAt: String!

  }

  type Comment {
    _id: ID!
    user_id: ID!
    user: User!
    tweet_id: ID!
    comment_text: String!
    liked_by: [User]
  }

  type PaginatedItems{
    tweets: [Tweet],
    endCursor: String!
  }

  type PaginatedComments{
    comments: [Comment],
    endCursor: String!
  }

  type ProfilePhotoUPloadPresignedURL {
    file_name: String!,
    file_type: String!,
    uploadURL: String!
  }

  type Query {
    me: User
    authenticate: Boolean
    getUserById(user_id: ID!): User
    getTweetById(tweet_id: ID!): Tweet
    getMyTweets(first:Int, after: ID): PaginatedItems!
    checkUsername(username: String!): Boolean
    homeTimeline(first:Int, after: ID): PaginatedItems!
    userTimeline(user_id: ID!,first:Int, after: ID): PaginatedItems!
    getTweetComments(tweet_id: ID!, first:Int,after:ID): PaginatedComments!
  }

  type Mutation {
    register(name: String, username: String!, email: String!, dob: Date, password: String! ): Token
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
    getProfilePhotoPresignedUploadURL(file_name: String!, file_type: String!): ProfilePhotoUPloadPresignedURL
  }
`;

module.exports = typeDefs;
