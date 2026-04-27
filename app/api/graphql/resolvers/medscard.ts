import { connectDB } from "@/app/lib/mongodb";
import { Medscard } from "@/app/models/Medscard";
import { GraphQLError } from "graphql";
import { ZodError } from "zod";
import { safeDate } from "@/app/helper/safeDate";
import { cardsValidator } from "@/app/lib/validators/cardsValidator";
import { sanitizeObject } from "@/app/sanitizer/sanitize";

type GraphQLContext = {
  user: any;
};

export const medscardResolvers = {
  Query: {
    medscards: async (_: any, { page, limit, search }: any) => {
      await connectDB();

      const skip = (page - 1) * limit;

      //   const filter = search
      //     ? {
      //         cardName: {
      //           $regex: search,
      //           $options: "i",
      //         },
      //       }
      //     : {};

      const filter = search ? { cardName: search } : {};

      const medscardsData = await Medscard.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalCount = await Medscard.countDocuments(filter);

      return {
        // medscards,
        medscards: medscardsData.map((p) => ({
          ...p.toObject(),
          // cardDate: new Date(p.cardDate).toISOString().split("T")[0],
          cardDate: safeDate(p.cardDate),
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    },

    medscard: async (_: any, { id }: any) => {
      await connectDB();

      const p = await Medscard.findById(id);

      if (!p) return null;

      return {
        ...p.toObject(),
        // cardDate: new Date(p.cardDate).toISOString().split("T")[0],
        cardDate: safeDate(p.cardDate),
      };
    },
  },

  Mutation: {
    createMedscard: async (_: any, { input }: any, ctx: GraphQLContext) => {
      if (!ctx.user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }
      try {
        await connectDB();

        const validatedData = cardsValidator.parse(input);

        const sanitizedData = sanitizeObject(validatedData);

        // const newMedscard = await Medscard.create({
        //   ...input,
        // });

        const newMedscard = await Medscard.create(sanitizedData);

        return newMedscard;
      } catch (error: any) {
        console.error("CREATE MEDS CARD ERROR:", error);
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

    updateMedscard: async (_: any, { id, input }: any, ctx: GraphQLContext) => {
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

        const updatedMedscard = await Medscard.findByIdAndUpdate(
          id,
          sanitizedData,
          {
            new: true,
          },
        );

        // const updatedMedscard = await Medscard.findByIdAndUpdate(id, input, {
        //   new: true,
        // });

        if (!updatedMedscard) {
          throw new Error("Meds Card not found");
        }

        return updatedMedscard;
      } catch (error: any) {
        console.error("UPDATING MEDS CARD ERROR:", error);
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

    deleteMedscard: async (_: any, { id }: any, ctx: any) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }
      try {
        await connectDB();

        const deleted = await Medscard.findByIdAndDelete(id);

        if (!deleted) {
          throw new Error("Meds Card not found");
        }

        return true;
      } catch (error: any) {
        console.error("DELETE MEDS CARD ERROR:", error);
        throw new Error(
          error.message || "Server error while deleting meds card",
        );
      }
    },
  },
};
