import { medscardResolvers } from "./medscard";
import { patientResolvers } from "./patient";

export const resolvers = {
  Query: {
    ...patientResolvers.Query,
    ...medscardResolvers.Query,
  },
  Mutation: {
    ...patientResolvers.Mutation,
    ...medscardResolvers.Mutation,
  },
};
