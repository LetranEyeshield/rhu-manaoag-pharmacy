// // new code with text index for better search performance
// import mongoose, { Schema, Model } from "mongoose";
// import { PatientType } from "../types/Patient";

// const PatientSchema = new Schema(
//   {
//     firstName: { type: String, required: true },
//     middleName: { type: String },
//     lastName: { type: String, required: true },
//     birthday: { type: Date, required: true },
//     age: { type: Number, required: true },
//     address: { type: String, required: true },
//     medicines: { type: [String], default: [] },
//   },
//   { timestamps: true },
// );

// // ⭐ SEARCH INDEX
// PatientSchema.index({
//   firstName: "text",
//   middleName: "text",
//   lastName: "text",
// });

// // 🔐 UNIQUE PATIENT INDEX (IMPORTANT) to avoid spamming of adding new patient
// PatientSchema.index(
//   {
//     firstName: 1,
//     lastName: 1,
//     birthday: 1,
//   },
//   {
//     unique: true,
//   },
// );

// export const Patient: Model<PatientType> =
//   mongoose.models.Patient || mongoose.model<PatientType>("Patient", PatientSchema);

import mongoose, { Model, Schema, Document } from "mongoose";

export interface IPatient extends Document {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthday: Date;
  age?: number | null;
  address: string;
  medicines: string[];
}

const PatientSchema = new Schema<IPatient>(
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

export const Patient: Model<IPatient> =
  mongoose.models.Patients || mongoose.model<IPatient>("Patients", PatientSchema);
