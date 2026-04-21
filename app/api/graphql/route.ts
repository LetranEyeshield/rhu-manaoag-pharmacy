import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { getUserFromRequest } from "@/app/lib/auth";

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: "/api/graphql",
   context: async ({ request }) => {
    const user = await getUserFromRequest(request);

    return {
      user,
    };
  },

  fetchAPI: { Response },
});

export { yoga as GET, yoga as POST };