import { connectDB } from "@/app/lib/mongodb";
import { Vitaminscard } from "@/app/models/Vitaminscard";
import { GraphQLError } from "graphql";
import { ZodError } from "zod";
import { safeDate } from "@/app/helper/safeDate";
import { cardsValidator } from "@/app/lib/validators/cardsValidator";
import { sanitizeObject } from "@/app/sanitizer/sanitize";

type GraphQLContext = {
  user: any;
};

export const vitaminscardResolvers = {
  Query: {
    vitaminscards: async (_: any, { page, limit, search }: any) => {
      await connectDB();

      const skip = (page - 1) * limit;

      const filter = search ? { cardName: search } : {};

      const vitaminscardsData = await Vitaminscard.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalCount = await Vitaminscard.countDocuments(filter);

      return {
        // vitaminscards,
        vitaminscards: vitaminscardsData.map((p) => ({
          ...p.toObject(),
          // cardDate: new Date(p.cardDate).toISOString().split("T")[0],
          cardDate: safeDate(p.cardDate),
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    },

    vitaminscard: async (_: any, { id }: any) => {
      await connectDB();

      const p = await Vitaminscard.findById(id);

      if (!p) return null;

      return {
        ...p.toObject(),
        // cardDate: new Date(p.cardDate).toISOString().split("T")[0],
        cardDate: safeDate(p.cardDate),
      };
    },
  },

  Mutation: {
    createVitaminscard: async (_: any, { input }: any, ctx: GraphQLContext) => {
      if (!ctx.user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        await connectDB();

        const validatedData = cardsValidator.parse(input);

        const sanitizedData = sanitizeObject(validatedData);

        const newVitaminscard = await Vitaminscard.create(sanitizedData);

        // const newVitaminscard = await Vitaminscard.create({
        //   ...input,
        // });

        return newVitaminscard;
      } catch (error: any) {
        console.error("CREATE VITAMINS CARD ERROR:", error);
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

    updateVitaminscard: async (
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

        const updatedVitaminscard = await Vitaminscard.findByIdAndUpdate(
          id,
          sanitizedData,
          {
            new: true,
          },
        );

        // const updatedVitaminscard = await Vitaminscard.findByIdAndUpdate(id, input, {
        //   new: true,
        // });

        if (!updatedVitaminscard) {
          throw new Error("Vitamins Card not found");
        }

        return updatedVitaminscard;
      } catch (error: any) {
        console.error("UPDATING VITAMINS CARD ERROR:", error);
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

    deleteVitaminscard: async (_: any, { id }: any, ctx: any) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }
      try {
        await connectDB();

        const deleted = await Vitaminscard.findByIdAndDelete(id);

        if (!deleted) {
          throw new Error("Vitamins Card not found");
        }

        return true;
      } catch (error: any) {
        console.error("DELETE VITAMINS CARD ERROR:", error);
        throw new Error(
          error.message || "Server error while deleting vitamins card",
        );
      }
    },
  },
};
