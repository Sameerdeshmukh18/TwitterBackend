const typeDefs = `
  type User {
    _id: ID!
    name: String
    username: String!
    email: String
    dob: String
    bio: String
    password: String!
    isVertified: Boolean
    followers: [User]
    following: [User]
  }

  type Token {
    token: String!
  }

  type Query {
    getUserById(user_id: ID!): User
  }

  type Mutation {
    register(name: String, username: String!, email: String!, password: String! ): User
    login(email: String!, password: String!): Token
  }
`;

module.exports = typeDefs;
