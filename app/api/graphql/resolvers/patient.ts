import { connectDB } from "@/app/lib/mongodb";
import { PatientValidator } from "@/app/lib/validators/patient";
import Patient from "@/app/models/Patient";
import { sanitizeInput } from "@/app/lib/sanitizer/sanitize";
import { sanitizeObject } from "@/app/lib/sanitizer/sanitize";

type GraphQLContext = {
  user: any;
};

export const patientResolvers = {
  Query: {
    patients: async (_: any, { page, limit, search }: any) => {
      await connectDB();

      const skip = (page - 1) * limit;

      const filter = search
        ? search.length < 3
          ? { fullname: { $regex: search, $options: "i" } }
          : { $text: { $search: search } }
        : {};

      const patients = await Patient.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalCount = await Patient.countDocuments(filter);

      return {
        patients,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    },

    patient: async (_: any, { id }: any) => {
      await connectDB();
      return Patient.findById(id);
    },
  },

  Mutation: {
    createPatient: async (_: any, { input }: any, ctx: GraphQLContext) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }
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

        if (existingPatient) {
          throw new Error("Patient already exists");
        }

        const newPatient = await Patient.create(sanitizedData);

        if (!newPatient) {
          throw new Error("Adding new patient failed");
        }

        return newPatient;
      } catch (error: any) {
        if (error.code === 11000) {
          throw new Error("Patient already exists");
        }
        console.error("CREATE PATIENT ERROR:", error);

        // Handle Zod errors cleanly
        if (error.name === "ZodError") {
          throw new Error(error.errors.map((e: any) => e.message).join(", "));
        }

        throw new Error(error.message || "Server error while adding patient");
      }
    },

    updatePatient: async (_: any, { id, input }: any, ctx: GraphQLContext) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }
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

        if (error.name === "ZodError") {
          throw new Error(error.errors.map((e: any) => e.message).join(", "));
        }

        throw new Error(error.message || "Server error while updating patient");
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
