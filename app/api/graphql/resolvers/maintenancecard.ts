import { safeDate } from "@/app/helper/safeDate";
import { connectDB } from "@/app/lib/mongodb";
import { cardsValidator } from "@/app/lib/validators/cardsValidator";
import { Maintenancecard } from "@/app/models/Maintenancecard";
import { sanitizeObject } from "@/app/sanitizer/sanitize";
import { GraphQLError } from "graphql";
import { ZodError } from "zod";

type GraphQLContext = {
  user: any;
};

export const maintenancecardResolvers = {
  Query: {
    maintenancecards: async (_: any, { page, limit, search }: any) => {
      await connectDB();

      const skip = (page - 1) * limit;

      const filter = search ? { cardName: search } : {};

      const maintenancecardsData = await Maintenancecard.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalCount = await Maintenancecard.countDocuments(filter);

      return {
        // maintenancecards,
        maintenancecards: maintenancecardsData.map((p) => ({
          ...p.toObject(),
          // cardDate: new Date(p.cardDate).toISOString().split("T")[0],
          cardDate: safeDate(p.cardDate),
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    },

    maintenancecard: async (_: any, { id }: any) => {
      await connectDB();

      const p = await Maintenancecard.findById(id);

      if (!p) return null;

      return {
        ...p.toObject(),
        // cardDate: new Date(p.cardDate).toISOString().split("T")[0],
        cardDate: safeDate(p.cardDate),
      };
    },
  },

  Mutation: {
    createMaintenancecard: async (
      _: any,
      { input }: any,
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }
      try {
        await connectDB();

        const validatedData = cardsValidator.parse(input);

        const sanitizedData = sanitizeObject(validatedData);

        // const newMaintenancecard = await Maintenancecard.create({
        //   ...input,
        // });

        const newMaintenancecard = await Maintenancecard.create(sanitizedData);

        return newMaintenancecard;
      } catch (error: any) {
        console.error("CREATE MAINTENANCE CARD ERROR:", error);
        if (error instanceof ZodError) {
          const message = error.issues.map((e) => e.message).join("\n");

          throw new GraphQLError(message, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        if (error instanceof GraphQLError) {
          throw error;
        }

        throw new GraphQLError(error.message || "Server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    updateMaintenancecard: async (
      _: any,
      { id, input }: any,
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }
      try {
        await connectDB();

        const PartialCardValidator = cardsValidator.partial();

        const validatedData = PartialCardValidator.parse(input);

        const sanitizedData = sanitizeObject(validatedData);

        // const updatedMaintenancecard = await Maintenancecard.findByIdAndUpdate(id, input, {
        //   new: true,
        // });

        const updatedMaintenancecard = await Maintenancecard.findByIdAndUpdate(
          id,
          sanitizedData,
          {
            new: true,
          },
        );

        if (!updatedMaintenancecard) {
          throw new Error("Maintenance Card not found");
        }

        return updatedMaintenancecard;
      } catch (error: any) {
        console.error("UPDATING MAINTENANCE CARD ERROR:", error);
        if (error instanceof ZodError) {
          const message = error.issues.map((e) => e.message).join("\n");

          throw new GraphQLError(message, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        if (error instanceof GraphQLError) {
          throw error;
        }

        throw new GraphQLError(error.message || "Server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    deleteMaintenancecard: async (_: any, { id }: any, ctx: any) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }
      try {
        await connectDB();

        const deleted = await Maintenancecard.findByIdAndDelete(id);

        if (!deleted) {
          throw new Error("Maintenance Card not found");
        }

        return true;
      } catch (error: any) {
        console.error("DELETE MAINTENANCE CARD ERROR:", error);
        throw new Error(
          error.message || "Server error while deleting maintenance card",
        );
      }
    },
  },
};
