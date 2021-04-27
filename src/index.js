import { GraphQLServer } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid'

const users = [
  {
    id: '123xcx',
    name: 'Some user 1',
    email: 'dddd@cdc.com',
    age: 23
  },
  {
    id: '123sas',
    name: 'Some user 2',
    email: 'dddd@cdc.com',
    age: 43
  },
  {
    id: '1sdcsdc',
    name: 'Some user 3',
    email: 'dddd@cdc.com',
    age: 43
  }
]

const posts = [
  {
    id: '1',
    title: 'title 1',
    body: 'body 1',
    published: true,
    author: '123xcx'
  },
  {
    id: '2',
    title: 'title 2',
    body: 'body 2',
    published: false,
    author: '123sas'
  },
  {
    id: '3',
    title: 'title 3',
    body: 'body 3',
    published: false,
    author: '1sdcsdc'
  },
  {
    id: '4',
    title: 'title 4',
    body: 'body 4',
    published: false,
    author: '123xcx'
  }
]

const comments = [
  {
    id: '1',
    text: 'comment 1',
    author: '123xcx',
    post: '2'
  },
  {
    id: '2',
    text: 'comment 2',
    author: '123sas',
    post: '2'
  },
  {
    id: '3',
    text: 'comment 3',
    author: '123sas',
    post: '3'
  }
]

const typeDefs = `
  type Query {
    users(query: String): [User!]!
    me: User!
    posts(query: String): [Post!]!
    comments: [Comment!]!
  }
  
  type Mutation {
    createUser(data: CreateUserInput): User!
    deleteUser(id: ID!): User!
    createPost(data: CreatePostInput): Post!
    createComment(data: CreateCommentInput): Comment!
  }
  
  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }
  
  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }
  
  input CreateCommentInput {
    text: String!
    author: ID!
    post: ID!
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }
  
  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }
  
  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`

const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if(!args.query) {
        return users
      }

      return users.filter(user => {
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    me() {
      return {
        id: '123abc',
        name: 'Mike',
        email: 'email@some.com'
      }
    },
    posts(parent, args, ctx, info) {
      if(!args.query) {
        return posts
      }

      return posts.filter(post => {
        return [post.title, post.body].some(item => item.includes(args.query.toLowerCase()))
      })
    },
    comments() {
      return comments
    }
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => user.email === args.data.email)

      if(emailTaken) {
        throw new Error("this email is already taken")
      }

      const newUser = {
        id: uuidv4(),
        ...args.data
      }

      users.push(newUser)

      return newUser
    },
    deleteUser(parent, args, ctx, info) {
      console.log(args.id)

      const userIndex = users.findIndex(user => user.id === args.id)

      if (userIndex === -1) {
        throw new Error('There is no such user')
      }

      const deletedUsers = users.splice(userIndex, 1)

      return deletedUsers[0]
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some(user => user.id === args.data.author)

      if (!userExists) {
        throw new Error('User not found')
      }

      const newPost = {
        id: uuidv4(),
        ...args.data
      }

      posts.push(newPost)

      return newPost
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some(user => user.id === args.data.author)
      const postExists = posts.some(post => post.id === args.data.post && post.published)

      if (!userExists || !postExists) {
        throw new Error('No user and corresponding post were found')
      }

      const newComment = {
        id: uuidv4(),
        ...args.data
      }

      comments.push(newComment)

      return newComment
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author
      })
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.post === parent.id)
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter(post => post.author === parent.id)
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.author === parent.id)
    }
  },
  Comment: {
    author(parent, args, ctx, inf) {
      return users.find(user => user.id === parent.author)
    },
    post(parent, args, ctx, inf) {
      return posts.find(post => post.id === parent.post)
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
})

server.start(() => {
  console.log('The server is up and running!')
})
