import { maintenancecardResolvers } from "./maintenancecard";
import { medscardResolvers } from "./medscard";
import { patientResolvers } from "./patient";
import { reportResolvers } from "./report";
import { vitaminscardResolvers } from "./vitaminscard";

export const resolvers = {
  Query: {
    ...patientResolvers.Query,
    ...medscardResolvers.Query,
    ...maintenancecardResolvers.Query,
    ...vitaminscardResolvers.Query,
    ...reportResolvers.Query,
  },
  Mutation: {
    ...patientResolvers.Mutation,
    ...medscardResolvers.Mutation,
    ...maintenancecardResolvers.Mutation,
    ...vitaminscardResolvers.Mutation,
  },
};
