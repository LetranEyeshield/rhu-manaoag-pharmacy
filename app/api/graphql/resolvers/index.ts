import { patientResolvers } from "./patient";

export const resolvers = {
  Query: {
    ...patientResolvers.Query,
  },
  Mutation: {
    ...patientResolvers.Mutation,
  },
};
