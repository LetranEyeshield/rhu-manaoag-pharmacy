import { connectDB } from "@/app/lib/mongodb";
import { Patient } from "@/app/models/Patient";

export const reportResolvers = {
  Query: {
    patients: async (_: any, { page, limit, search }: any) => {
      await connectDB();

      const skip = (page - 1) * limit;

      const filter = search ? { address: search } : {};

      const patientData = await Patient.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalCount = await Patient.countDocuments(filter);

      return {
        // patients,
        patients: patientData.map((p) => ({
          ...p.toObject(),
          birthday: new Date(p.birthday).toISOString().split("T")[0],
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    },

    patient: async (_: any, { id }: any) => {
      await connectDB();

      const p = await Patient.findById(id);

      if (!p) return null;

      return {
        ...p.toObject(),
        birthday: new Date(p.birthday).toISOString().split("T")[0],
      };
    },
  },
};
