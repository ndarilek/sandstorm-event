import {makeExecutableSchema, addMockFunctionsToSchema} from "graphql-tools"
import {createApolloServer} from "meteor/apollo"

import {typeDefs, resolvers} from "./schema"

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

createApolloServer({
  schema,
})
