// new code with text index for better search performance
import mongoose, { Schema, model, models } from "mongoose";

const PatientSchema = new Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    birthday: { type: Date, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    medicines: { type: [String], default: [] },
  },
  { timestamps: true },
);

// ⭐ SEARCH INDEX
PatientSchema.index({
  firstName: "text",
  middleName: "text",
  lastName: "text",
});

// 🔐 UNIQUE PATIENT INDEX (IMPORTANT) to avoid spamming of adding new patient
PatientSchema.index(
  {
    firstName: 1,
    lastName: 1,
    birthday: 1,
  },
  {
    unique: true,
  },
);

const Patient = models.Patient || model("Patient", PatientSchema);
export default Patient;
