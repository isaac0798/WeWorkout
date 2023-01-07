import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLContext } from "./context";
import { User } from "@prisma/client";
import typeDefs from "./schema.graphql";

const resolvers = {
  Query: {
    info: () => 'Test',
    allUsers: () => async (parent: unknown, args: {}, context: GraphQLContext) => {
      console.log(context.prisma.user.findMany)
      return context.prisma.user.findMany()
    },
  },
  Users: {
    id: (parent: User) => parent.id,
    createdAt: (parent: User) => parent.joined,
    firstname: (parent: User) => parent.firstname,
    surname: (parent: User) => parent.lastname,
  }
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
