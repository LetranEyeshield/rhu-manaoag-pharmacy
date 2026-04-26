import { connectDB } from "@/app/lib/mongodb";
import { PatientValidator } from "@/app/lib/validators/patient";
import { Patient } from "@/app/models/Patient";
//import { sanitizeInput } from "@/app/lib/sanitizer/sanitize";
import { sanitizeObject } from "@/app/sanitizer/sanitize";
import { ZodError } from "zod";
import { GraphQLError } from "graphql";

type GraphQLContext = {
  user: any;
};

export const patientResolvers = {
  Query: {
    patients: async (_: any, { page, limit, search, address }: any) => {
      await connectDB();

      const skip = (page - 1) * limit;

      // const filter =
      //   search && search.trim() !== ""
      //     ? search.length >= 3
      //       ? { $text: { $search: search } }
      //       : {
      //           $or: [
      //             { firstName: { $regex: search, $options: "i" } },
      //             { middleName: { $regex: search, $options: "i" } },
      //             { lastName: { $regex: search, $options: "i" } },
      //           ],
      //         }
      //     : {};

      // const filter =
      //   search && search.trim() !== ""
      //     ? {
      //         $or: [
      //           { firstName: { $regex: search, $options: "i" } },
      //           { middleName: { $regex: search, $options: "i" } },
      //           { lastName: { $regex: search, $options: "i" } },
      //         ],
      //       }
      //     : {};

      let filter: any = {};

      // 🔍 Name search
      if (search && search.trim() !== "") {
        filter.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { middleName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ];
      }

      // 📍 Address filter
      if (address && address.trim() !== "") {
        filter.address = address;
      }

      console.log("FILTER:", filter);
      console.log("SEARCH:", search);

      const patientsData = await Patient.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalCount = await Patient.countDocuments(filter);

      return {
        // patients,
        patients: patientsData.map((p) => ({
          ...p.toObject(),
          // birthday: p.birthday ? new Date(p.birthday).toISOString() : null,
          birthday: p.birthday
            ? new Date(p.birthday).toISOString().split("T")[0]
            : null,
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    },

    // patient: async (_: any, { id }: any) => {
    //   await connectDB();
    //   return Patient.findById(id);
    // },
    patient: async (_: any, { id }: any) => {
      await connectDB();

      const p = await Patient.findById(id);

      if (!p) return null;

      return {
        ...p.toObject(),
        birthday: p.birthday
          ? new Date(p.birthday).toISOString().split("T")[0]
          : null,
      };
    },
  },

  Mutation: {
    createPatient: async (_: any, { input }: any, ctx: GraphQLContext) => {
      // if (!ctx.user) {
      //   throw new Error("Unauthorized");
      // }
      // if (!ctx.user) {
      //   throw new GraphQLError("Unauthorized", {
      //     extensions: { code: "UNAUTHORIZED" },
      //   });
      // }
      console.log("CTX USER:", ctx.user);
      try {
        await connectDB();

        // ✅ Validate input
        const validatedData = PatientValidator.parse(input);

        // // ✅ 2. Sanitize AFTER validation
        // const sanitizedData = {
        //   firstName: sanitizeInput(validatedData.firstName),
        //   middleName: validatedData.middleName
        //     ? sanitizeInput(validatedData.middleName)
        //     : undefined,
        //   lastName: sanitizeInput(validatedData.lastName),
        //   birthday: sanitizeInput(validatedData.birthday),
        //   age: validatedData.age ? sanitizeInput(validatedData.age.toString()) : 0, // age is a number, no need to sanitize
        //   address: sanitizeInput(validatedData.address),
        //   medicines: validatedData.medicines.map((med) => sanitizeInput(med)),
        // };

        // ✅ Automatically sanitize everything
        const sanitizedData = sanitizeObject(validatedData);

        // 🔍 CHECK IF EXISTS FIRST
        const existingPatient = await Patient.findOne({
          firstName: new RegExp(`^${sanitizedData.firstName}$`, "i"),
          lastName: new RegExp(`^${sanitizedData.lastName}$`, "i"),
          birthday: sanitizedData.birthday,
        });

        // if (existingPatient) {
        //   throw new Error("Patient already exists");
        // }

        if (existingPatient) {
          throw new GraphQLError("Patient already exists", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const newPatient = await Patient.create(sanitizedData);

        if (!newPatient) {
          throw new GraphQLError("Adding new patient failed", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        return newPatient;
      } catch (error: any) {
        console.error("CREATE PATIENT ERROR:", error);
        if (error.code === 11000) {
          throw new GraphQLError("Patient already exists", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        // Handle Zod errors cleanly
        // if (error.name === "ZodError") {
        //   throw new Error(error.errors.map((e: any) => e.message).join(", "));
        // }

        // if (error instanceof ZodError) {
        //   // throw new GraphQLError(error.issues.map((e) => e.message).join(", "), {
        //   //   extensions: { code: "BAD_USER_INPUT" },
        //   // });
        //   const message = error.issues.map((e) => `• ${e.message}`).join("\n");
        //   throw new GraphQLError(
        //     message,
        //     {
        //       extensions: {
        //         code: "BAD_USER_INPUT",
        //       },
        //     },
        //   );
        // }

        if (error instanceof ZodError) {
          const message = error.issues.map((e) => e.message).join("\n");

          throw new GraphQLError(message, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        if (error instanceof GraphQLError) {
          throw error;
        }

        // throw new Error(error.message || "Server error while adding patient");
        // throw new GraphQLError(error.issues.map((e) => e.message).join(", "), {
        //   extensions: {
        //     code: "BAD_USER_INPUT",
        //   },
        // });

        throw new GraphQLError(error.message || "Server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    updatePatient: async (_: any, { id, input }: any, ctx: GraphQLContext) => {
      // if (!ctx.user) {
      //   throw new Error("Unauthorized");
      // }
      console.log("CTX USER:", ctx.user);
      try {
        await connectDB();

        const PartialPatientValidator = PatientValidator.partial();

        // ✅ Validate input (partial for updates)
        const validatedData = PartialPatientValidator.parse(input);

        // ✅ 2. Sanitize AFTER validation
        const sanitizedData = sanitizeObject(validatedData);

        // ✅ Automatically sanitize everything
        //const sanitizedData = sanitizeObject(validatedData);

        const updatedPatient = await Patient.findByIdAndUpdate(
          id,
          sanitizedData,
          {
            new: true,
          },
        );

        if (!updatedPatient) {
          throw new Error("Patient not found");
        }

        return updatedPatient;
      } catch (error: any) {
        console.error("UPDATE PATIENT ERROR:", error);

        // if (error.name === "ZodError") {
        //   throw new Error(error.errors.map((e: any) => e.message).join(", "));
        // }

        // throw new Error(error.message || "Server error while updating patient");

        if (error instanceof ZodError) {
          const message = error.issues.map((e) => e.message).join("\n");

          throw new GraphQLError(message, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        if (error instanceof GraphQLError) {
          throw error;
        }

        // throw new Error(error.message || "Server error while adding patient");
        // throw new GraphQLError(error.issues.map((e) => e.message).join(", "), {
        //   extensions: {
        //     code: "BAD_USER_INPUT",
        //   },
        // });

        throw new GraphQLError(error.message || "Server error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    deletePatient: async (_: any, { id }: any, ctx: any) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }
      try {
        await connectDB();

        const deleted = await Patient.findByIdAndDelete(id);

        if (!deleted) {
          throw new Error("Patient not found");
        }

        return true;
      } catch (error: any) {
        console.error("DELETE PATIENT ERROR:", error);
        throw new Error(error.message || "Server error while deleting patient");
      }
    },
  },
};
